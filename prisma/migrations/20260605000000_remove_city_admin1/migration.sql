-- DropIndex
DROP INDEX "BucketList_countryCode_admin1Code_cityName_idx";

-- AlterTable
ALTER TABLE "BucketList" DROP COLUMN "admin1Code",
DROP COLUMN "cityName";
