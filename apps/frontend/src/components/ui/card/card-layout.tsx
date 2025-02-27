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
  cardContentClassName?: string;
};

export default function CardLayout({
  cardTitle,
  cardDescription,
  cardContent,
  cardClassName,
  cardContentClassName
}: CardProps) {
  return (
    <Card className={cn("", cardClassName)}>
      <CardHeader>
        <CardTitle>{cardTitle}</CardTitle>
        <CardDescription>{cardDescription}</CardDescription>
      </CardHeader>
      <CardContent className={cn("", cardContentClassName)}>
        {cardContent}
      </CardContent>
    </Card>
  );
}
