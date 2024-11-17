-- Première transaction pour l'enum
BEGIN;
-- AlterEnum
ALTER TYPE "Status" ADD VALUE 'NEW';
ALTER TYPE "Status" ADD VALUE 'ACTIVE';
ALTER TYPE "Status" ADD VALUE 'INACTIVE';
COMMIT;

-- Deuxième transaction pour les modifications de table
BEGIN;
-- AlterTable
-- Ajouter lastUpdate avec une valeur par défaut temporaire
ALTER TABLE "Company" 
ADD COLUMN "lastUpdate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Copier les données de updatedAt vers lastUpdate
UPDATE "Company" 
SET "lastUpdate" = "updatedAt";

-- Supprimer l'ancienne colonne updatedAt
ALTER TABLE "Company" 
DROP COLUMN "updatedAt";

-- Enlever la valeur par défaut de lastUpdate
ALTER TABLE "Company" 
ALTER COLUMN "lastUpdate" DROP DEFAULT;

-- Mettre à jour le status par défaut
ALTER TABLE "Company" 
ALTER COLUMN "status" SET DEFAULT 'NEW';
COMMIT;