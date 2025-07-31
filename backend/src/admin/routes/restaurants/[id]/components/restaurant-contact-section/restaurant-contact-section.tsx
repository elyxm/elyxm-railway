import { Container, Heading } from "@medusajs/ui";
import { SectionRow } from "../../../../../components/section-row";

type RestaurantContactSectionProps = {
  restaurant: any; // TODO: Replace with proper type
};

export const RestaurantContactSection = ({ restaurant }: RestaurantContactSectionProps) => {
  return (
    <Container className="divide-y p-0">
      <div className="px-6 py-4">
        <Heading level="h3">Contact Information</Heading>
      </div>

      <SectionRow title="Email" value={restaurant.email} />
      <SectionRow title="Phone" value={restaurant.phone} />
      <SectionRow title="Address" value={restaurant.address} />
    </Container>
  );
};
