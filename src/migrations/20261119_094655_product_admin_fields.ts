import type { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-postgres'
import { sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "products_variant_axes_options" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar
  );

  CREATE TABLE "products_variant_axes" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar
  );

  ALTER TABLE "products" ADD COLUMN "variant_label" varchar;
  ALTER TABLE "products" ADD COLUMN "has_variants" boolean DEFAULT false;
  ALTER TABLE "products" ADD COLUMN "parent_product_id" integer;
  ALTER TABLE "products_variant_axes_options" ADD CONSTRAINT "products_variant_axes_options_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products_variant_axes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_variant_axes" ADD CONSTRAINT "products_variant_axes_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "products_variant_axes_options_order_idx" ON "products_variant_axes_options" USING btree ("_order");
  CREATE INDEX "products_variant_axes_options_parent_id_idx" ON "products_variant_axes_options" USING btree ("_parent_id");
  CREATE INDEX "products_variant_axes_order_idx" ON "products_variant_axes" USING btree ("_order");
  CREATE INDEX "products_variant_axes_parent_id_idx" ON "products_variant_axes" USING btree ("_parent_id");
  ALTER TABLE "products" ADD CONSTRAINT "products_parent_product_id_products_id_fk" FOREIGN KEY ("parent_product_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "products_parent_product_idx" ON "products" USING btree ("parent_product_id");`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "products_variant_axes_options" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "products_variant_axes" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "products_variant_axes_options" CASCADE;
  DROP TABLE "products_variant_axes" CASCADE;
  ALTER TABLE "products" DROP CONSTRAINT "products_parent_product_id_products_id_fk";

  DROP INDEX "products_parent_product_idx";
  ALTER TABLE "products" DROP COLUMN "variant_label";
  ALTER TABLE "products" DROP COLUMN "has_variants";
  ALTER TABLE "products" DROP COLUMN "parent_product_id";`)
}
