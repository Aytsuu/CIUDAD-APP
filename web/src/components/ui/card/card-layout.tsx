import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./card";
import { cn } from "@/lib/utils";

type CardProps = {
  cardTitle?: string;
  cardDescription?: React.ReactNode;
  cardContent: React.ReactNode;
  cardClassName?: string;
  CardTitleClassName?: string;
  cardHeaderClassName?: string;
  cardContentClassName?: string;
};

export default function CardLayout({
  cardTitle,
  cardDescription,
  cardContent,
  cardClassName,
  CardTitleClassName,
  cardHeaderClassName,
  cardContentClassName
}: CardProps) {
  return (
    <Card className={cn("", cardClassName)}>
      <CardHeader className={cn("", cardHeaderClassName)}>
        <CardTitle className={cn("", CardTitleClassName)}>{cardTitle}</CardTitle>
        <CardDescription>{cardDescription}</CardDescription>
      </CardHeader>
      <CardContent className={cn("", cardContentClassName)}>
        {cardContent}
      </CardContent>
    </Card>
  );
}
