import chromium from 'chrome-aws-lambda'
import { Browser, Page, Request } from 'puppeteer-core'

export class GooglePlacesScraper {
  private browser: Browser | null = null

  async init() {
    const executablePath = await chromium.executablePath

    if (!executablePath) {
      throw new Error('Chrome executable not found')
    }

    this.browser = await chromium.puppeteer.launch({
      args: [
        ...chromium.args,
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
        '--lang=fr-FR,fr'
      ],
      defaultViewport: chromium.defaultViewport,
      executablePath: executablePath,
      headless: chromium.headless,
      ignoreHTTPSErrors: true
    })
  }

  async scrapeCompany(query: string, location: string) {
    if (!this.browser) await this.init()
    const page = await this.setupPage()

    try {
      const searchQuery = encodeURIComponent(`${query} ${location}`)
      const url = `https://www.google.fr/maps/search/${searchQuery}`
      
      await page.setRequestInterception(true)
      page.on('request', (request: Request) => {
        if (['image', 'stylesheet', 'font'].includes(request.resourceType())) {
          request.abort()
        } else {
          request.continue()
        }
      })

      await page.goto(url, { 
        waitUntil: 'networkidle0',
        timeout: 30000 
      })

      // Gestion du popup de consentement
      await new Promise(resolve => setTimeout(resolve, 2000));
      try {
        const consentButton = await page.$('button[aria-label*="Tout accepter"]');
        if (consentButton) {
          await consentButton.click();
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      } catch {
        console.log('Pas de popup de consentement détecté');
      }

      // Attendre le chargement initial des résultats
      await page.waitForFunction(
        () => document.querySelectorAll('.Nv2PK').length > 0,
        { timeout: 30000 }
      );

      // Fonction pour faire défiler et charger plus de résultats
      const scrollAndWait = async () => {
        return await page.evaluate(async () => {
          const container = document.querySelector('.m6QErb[aria-label*="Résultats"]');
          if (!container) return { previousCount: 0, newCount: 0 };

          const previousCount = document.querySelectorAll('.Nv2PK').length;
          container.scrollTo(0, container.scrollHeight);

          return new Promise(resolve => {
            setTimeout(() => {
              const newCount = document.querySelectorAll('.Nv2PK').length;
              resolve({ previousCount, newCount });
            }, 2000);
          });
        });
      };

      // Faire défiler jusqu'à ce qu'il n'y ait plus de nouveaux résultats
      let noNewResultsCount = 0;
      const MAX_NO_NEW_RESULTS = 3;
      
      while (noNewResultsCount < MAX_NO_NEW_RESULTS) {
        console.log('Défilement pour charger plus de résultats...');
        const { previousCount, newCount } = await scrollAndWait() as { previousCount: number, newCount: number };
        console.log(`Résultats: ${previousCount} -> ${newCount}`);

        if (newCount <= previousCount) {
          noNewResultsCount++;
        } else {
          noNewResultsCount = 0;
        }

        await page.waitForTimeout(3000);
      }

      // Extraction des données
      console.log('Extraction des données...');
      const companies = await page.evaluate(() => {
        const results = Array.from(document.querySelectorAll('.Nv2PK'));
        console.log(`Traitement de ${results.length} résultats`);

        return results.map(result => {
          // Debug: afficher le HTML pour comprendre la structure
          console.log('HTML du résultat:', result.outerHTML);

          const nameElement = result.querySelector('.qBF1Pd');
          const name = nameElement?.textContent?.trim() || '';

          const ratingElement = result.querySelector('.MW4etd');
          const rating = parseFloat(ratingElement?.textContent || '0');

          const reviewsElement = result.querySelector('.UY7F9');
          const reviews = parseInt(reviewsElement?.textContent?.replace(/[()]/g, '') || '0');

          let address = '';
          
          // Fonction utilitaire pour valider une adresse
          const isValidAddress = (text: string | undefined): boolean => {
            if (!text) return false;
            
            // Exclure les formats invalides
            const invalidFormats = [
              /^\d+[.,]\d+\(\d+\)$/, // Format "4,6(57)" ou "4.6(57)"
              /^\d+\(\d+\)$/, // Format "5(42)"
              /^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/, // Numéros de téléphone
              /^\d{2}(?:\s*\d{2}){4}$/, // Format téléphone simple
              /^\d+\s*étoiles?$/, // Notes
              /^\d+\s*avis$/, // Nombre d'avis
              /^\d+[.,]\d+$/, // Nombres décimaux simples (notes)
              /^\d+[.,]\d+\s*\/\s*5$/ // Notes sur 5
            ];

            if (invalidFormats.some(format => text.match(format))) {
              console.log(`Format invalide détecté pour: "${text}"`);
              return false;
            }
            
            // Vérifier la présence d'éléments typiques d'une adresse
            const addressIndicators = [
              'rue', 'avenue', 'boulevard', 'place', 'chemin', 'route', 
              'impasse', 'allée', 'quai', 'cours', 'passage',
              'Rue', 'Avenue', 'Boulevard', 'Place', 'Chemin', 'Route',
              'Impasse', 'Allée', 'Quai', 'Cours', 'Passage',
              'Rte', 'Av.', 'Bd', 'Pl.', 'Chem.',
              'ZA', 'ZI', 'Lotissement',
              /\d{5}/, // Code postal
              /^\d+[,\s]+(bis|ter)?/ // Numéro de rue
            ];
            
            const isValidAddressFormat = addressIndicators.some(indicator => 
              typeof indicator === 'string' 
                ? text.includes(indicator)
                : text.match(indicator)
            );

            if (!isValidAddressFormat) {
              console.log(`Pas d'indicateur d'adresse trouvé pour: "${text}"`);
            }

            return isValidAddressFormat;
          };

          // Essayer d'abord de trouver l'adresse dans la section dédiée
          const addressSection = result.querySelector('.W4Efsd:nth-child(2)');
          if (addressSection) {
            const spans = Array.from(addressSection.querySelectorAll('span'));
            for (const span of spans) {
              const text = span.textContent?.trim();
              if (text && isValidAddress(text)) {
                address = text;
                break;
              }
            }
          }

          // Si aucune adresse trouvée, essayer les autres sélecteurs
          if (!address) {
            const addressSelectors = [
              '.W4Efsd span[jsan*="address"]',
              '.W4Efsd span[role="text"]',
              '.W4Efsd span:not([aria-hidden="true"])',
              '[data-tooltip]'
            ];

            for (const selector of addressSelectors) {
              const elements = Array.from(result.querySelectorAll(selector));
              for (const element of elements) {
                const text = element.textContent?.trim();
                if (text && isValidAddress(text)) {
                  address = text;
                  break;
                }
              }
              if (address) break;
            }
          }

          // Nettoyer l'adresse finale
          address = address
            .replace(/·/g, '')
            .replace(/\s+/g, ' ')
            .replace(/^[,\s]+|[,\s]+$/g, '') // Enlever les virgules et espaces au début/fin
            .trim();

          console.log(`Adresse trouvée pour ${name}:`, address);

          const phoneElement = result.querySelector('.UsdlK');
          const phone = phoneElement?.textContent?.trim() || '';

          const websiteElement = result.querySelector('a.lcr4fd');
          const website = websiteElement?.getAttribute('href') || '';

          return {
            name,
            rating,
            reviews,
            address,
            phone,
            website
          };
        });
      });

      console.log(`${companies.length} entreprises extraites avec succès`);
      return companies;

    } catch (error) {
      console.error('Erreur lors du scraping:', error)
      throw error
    } finally {
      await page.close()
    }
  }

  private async setupPage(): Promise<Page> {
    if (!this.browser) await this.init()
    const page = await this.browser!.newPage()
    
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36')
    
    await page.setViewport({
      width: 1920,
      height: 1080
    })

    return page
  }

  async close() {
    if (this.browser) {
      await this.browser.close()
      this.browser = null
    }
  }
}