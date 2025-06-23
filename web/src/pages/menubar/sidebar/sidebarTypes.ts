export type AnotherSubMenuItem = {
  title: string;
  url: string;
};

export type SubMenuItem = {
  title: string;
  url: string;
  anotherItems?: AnotherSubMenuItem[];
};

export type MenuItem = {
  title: string;
  url?: string;
  subItems?: boolean;
  items?: SubMenuItem[];
};

export interface SubMenuItemProps {
  item: SubMenuItem;
  activeItem: string;
  setActiveItem: (title: string) => void;
}

export interface MenuItemProps {
  item: MenuItem;
  activeItem: string;
  setActiveItem: (title: string) => void;
}