import { Container, Heading } from "@medusajs/ui";

type RestaurantImageSectionProps = {
  restaurant: any; // TODO: Replace with proper type
};

export const RestaurantImageSection = ({ restaurant }: RestaurantImageSectionProps) => {
  if (!restaurant.image_url) {
    return null;
  }

  return (
    <Container className="divide-y p-0">
      <div className="px-6 py-4">
        <Heading level="h3">Restaurant Image</Heading>
      </div>

      <div className="p-6">
        <div className="border rounded-lg overflow-hidden">
          <img
            src={restaurant.image_url}
            alt={restaurant.name}
            className="w-full h-48 object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = "none";
            }}
          />
        </div>
      </div>
    </Container>
  );
};
