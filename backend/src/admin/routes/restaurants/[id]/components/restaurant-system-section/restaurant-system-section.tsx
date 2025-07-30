import { Container, Heading, Text, Tooltip } from "@medusajs/ui";
import { SectionRow } from "../../../../../components/section-row";

type RestaurantSystemSectionProps = {
  restaurant: any; // TODO: Replace with proper type
};

export const RestaurantSystemSection = ({ restaurant }: RestaurantSystemSectionProps) => {
  return (
    <Container className="divide-y p-0">
      <div className="px-6 py-4">
        <Heading level="h3">System Information</Heading>
      </div>

      <SectionRow
        title="Restaurant ID"
        value={
          <Tooltip content={restaurant.id}>
            <Text className="font-mono text-sm bg-ui-bg-subtle px-2 py-1 rounded truncate max-w-[200px] cursor-help">
              {restaurant.id}
            </Text>
          </Tooltip>
        }
      />
      <SectionRow title="Created At" value={new Date(restaurant.created_at).toLocaleString()} />
      <SectionRow title="Updated At" value={new Date(restaurant.updated_at).toLocaleString()} />
    </Container>
  );
};
