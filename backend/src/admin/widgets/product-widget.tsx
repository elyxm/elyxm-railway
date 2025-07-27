import { defineWidgetConfig } from "@medusajs/admin-sdk";
import { AdminProduct, AdminProductVariant, DetailWidgetProps } from "@medusajs/framework/types";
import { Container, Heading } from "@medusajs/ui";
import { useQuery } from "@tanstack/react-query";
import clsx from "clsx";
import { Link } from "react-router-dom";
import { sdk } from "../lib/sdk";

const Widget = ({ data: product }: DetailWidgetProps<AdminProduct>) => {
  console.log("product", product);

  return (
    <Container className="divide-y p-0">
      <div className="flex flex-col justify-between px-6 py-4 gap-4">
        <Heading level="h1">Product Details</Heading>
        <ProductCategories categories={product.categories} />
        <ProductCollection collection={product.collection} />
        <ProductTags tags={product.tags} />
        <ProductImages images={product.images} />
        <ProductOptions options={product.options} />
      </div>
      <div className="flex flex-col justify-between px-6 py-4 gap-4">
        <ProductVariants productId={product.id} />
      </div>
    </Container>
  );
};

type ProductCategoriesProps = {
  categories: AdminProduct["categories"];
};

const ProductCategories: React.FC<ProductCategoriesProps> = (props) => {
  const { categories } = props;

  const listRenderer = (categories: AdminProduct["categories"]) => {
    return categories.map((category) => <li key={category.id}>{category.name}</li>);
  };

  return <SectionList heading="Categories" items={categories} listRenderer={listRenderer} />;
};

type ProductCollectionProps = {
  collection: AdminProduct["collection"];
};

const ProductCollection: React.FC<ProductCollectionProps> = (props) => {
  const { collection } = props;

  if (!collection) {
    return <Section heading="Collection">n/a</Section>;
  }

  return (
    <Section heading="Collection">
      <ul className="flex flex-col list-disc list-outside pl-5">
        <li>
          <span className="font-normal">{collection.title}</span>
        </li>
      </ul>
    </Section>
  );
};

type ProductTagsProps = {
  tags: AdminProduct["tags"];
};

const ProductTags: React.FC<ProductTagsProps> = (props) => {
  const { tags } = props;

  const listRenderer = (tags: AdminProduct["tags"]) => {
    return tags.map((tag) => <li key={tag.id}>{tag.value}!!!</li>);
  };

  return <SectionList heading="Tags" items={tags} listRenderer={listRenderer} />;
};

type ProductImagesProps = {
  images: AdminProduct["images"];
};

const ProductImages: React.FC<ProductImagesProps> = (props) => {
  const { images } = props;

  const listRenderer = (images: AdminProduct["images"]) => {
    return images.map((image) => (
      <li key={image.id}>
        <img className="w-16 h-16 rounded-md" src={image.url} alt={image.id} />
      </li>
    ));
  };

  return <SectionList heading="Images" items={images} type="grid" listRenderer={listRenderer} />;
};

type ProductOptionsProps = {
  options: AdminProduct["options"];
};

const ProductOptions: React.FC<ProductOptionsProps> = (props) => {
  const { options } = props;

  const listRenderer = (options: AdminProduct["options"]) => {
    return options.map((option) => (
      <li key={option.id} className="mb-2 last:mb-0">
        <Heading level="h3">{option.title}</Heading>
        <ul className="flex flex-col list-disc list-outside pl-5">
          {option.values.map((value) => (
            <li key={value.id}>{value.value}</li>
          ))}
        </ul>
      </li>
    ));
  };

  return <SectionList heading="Options" items={options} listRenderer={listRenderer} />;
};

type ProductVariantsProps = {
  productId: AdminProduct["id"];
};

const ProductVariants: React.FC<ProductVariantsProps> = (props) => {
  const { productId } = props;

  const { data, isLoading } = useQuery({
    queryKey: ["product-variants", productId],
    queryFn: () => sdk.admin.product.listVariants(productId, { fields: "id,title" }),
  });

  const listRenderer = (variants: AdminProductVariant[]) => {
    return variants.map((variant) => (
      <li key={variant.id}>
        <Link to={`/products/${productId}/variants/${variant.id}`}>{variant.title}</Link>
      </li>
    ));
  };

  if (isLoading) {
    return (
      <Section heading="Variants">
        <span>Loading...</span>
      </Section>
    );
  }

  return <SectionList heading="Variants" items={data?.variants} listRenderer={listRenderer} />;
};

/* SHARED COMPONENTS */

type SectionProps = {
  children?: React.ReactNode;
  heading: string;
};

const Section: React.FC<SectionProps> = (props) => {
  const { children, heading } = props;

  return (
    <section>
      <Heading level="h2">{heading}</Heading>
      {children}
    </section>
  );
};

type SectionListProps = {
  heading: string;
  items?: any[];
  listRenderer: (items: any[]) => React.ReactNode;
  type?: "list" | "grid";
};

const SectionList: React.FC<SectionListProps> = (props) => {
  const { heading, items, listRenderer, type = "list" } = props;

  if (!items || items.length === 0) {
    return <Section heading={heading}>n/a</Section>;
  }

  return (
    <Section heading={heading}>
      <ul className={clsx(type === "grid" ? "flex gap-2 flex-wrap" : "flex flex-col list-disc list-outside pl-5")}>
        {listRenderer(items)}
      </ul>
    </Section>
  );
};

// The widget's configurations
export const config = defineWidgetConfig({
  zone: "product.details.side.before",
});

export default Widget;
