import { PencilSquare } from "@medusajs/icons";
import { Container, Heading, StatusBadge } from "@medusajs/ui";
import { ActionMenu } from "../../../../../components/action-menu";
import { SectionRow } from "../../../../../components/section-row";

type RestaurantGeneralSectionProps = {
  restaurant: any; // TODO: Replace with proper type
  onEdit: () => void;
};

export const RestaurantGeneralSection = ({ restaurant, onEdit }: RestaurantGeneralSectionProps) => {
  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <Heading>{restaurant.name}</Heading>
        <div className="flex items-center gap-x-4">
          <StatusBadge color={restaurant.is_open ? "green" : "red"}>
            {restaurant.is_open ? "Open" : "Closed"}
          </StatusBadge>
          <ActionMenu
            groups={[
              {
                actions: [
                  {
                    label: "Edit",
                    onClick: onEdit,
                    icon: <PencilSquare />,
                  },
                ],
              },
            ]}
          />
        </div>
      </div>

      <SectionRow title="Description" value={restaurant.description} />
      <SectionRow title="Handle" value={`/${restaurant.handle}`} />
    </Container>
  );
};
