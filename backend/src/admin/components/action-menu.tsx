import { EllipsisHorizontal } from "@medusajs/icons";
import { DropdownMenu, IconButton, clx } from "@medusajs/ui";
import { ReactNode } from "react";
import { Link } from "react-router-dom";

export type Action = {
  icon: ReactNode;
  label: string;
  disabled?: boolean;
} & (
  | {
      to: string;
      onClick?: never;
    }
  | {
      onClick: () => void;
      to?: never;
    }
);

export type ActionGroup = {
  actions: Action[];
};

export type ActionMenuProps = {
  groups: ActionGroup[];
};

export const ActionMenu = ({ groups }: ActionMenuProps) => {
  return (
    <DropdownMenu>
      <DropdownMenu.Trigger asChild>
        <IconButton size="small" variant="transparent">
          <EllipsisHorizontal />
        </IconButton>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content>
        {groups.map((group, index) => {
          if (!group.actions.length) {
            return null;
          }

          const isLast = index === groups.length - 1;

          return (
            <DropdownMenu.Group key={index}>
              {group.actions.map((action, actionIndex) => {
                if (action.onClick) {
                  return (
                    <DropdownMenu.Item
                      disabled={action.disabled}
                      key={actionIndex}
                      onClick={(e) => {
                        e.stopPropagation();
                        action.onClick();
                      }}
                      className={clx("[&_svg]:text-ui-fg-subtle flex items-center gap-x-2", {
                        "[&_svg]:text-ui-fg-disabled": action.disabled,
                      })}
                    >
                      {action.icon}
                      <span>{action.label}</span>
                    </DropdownMenu.Item>
                  );
                }

                return (
                  <DropdownMenu.Item
                    key={actionIndex}
                    className={clx("[&_svg]:text-ui-fg-subtle flex items-center gap-x-2", {
                      "[&_svg]:text-ui-fg-disabled": action.disabled,
                    })}
                    asChild
                    disabled={action.disabled}
                  >
                    <Link to={action.to!} onClick={(e) => e.stopPropagation()}>
                      {action.icon}
                      <span>{action.label}</span>
                    </Link>
                  </DropdownMenu.Item>
                );
              })}
              {!isLast && <DropdownMenu.Separator />}
            </DropdownMenu.Group>
          );
        })}
      </DropdownMenu.Content>
    </DropdownMenu>
  );
};
