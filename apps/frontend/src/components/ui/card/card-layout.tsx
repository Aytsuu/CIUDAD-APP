import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./card";
import { cn } from "@/lib/utils";

type CardProps = {
  cardHeader: string;
  cardDescription?: string;
  cardContent: React.ReactNode;
  cardFooter?: string;
  cardClassName?: string;
};

export default function CardLayout({
  cardHeader,
  cardDescription,
  cardContent,
  cardFooter,
  cardClassName,
}: CardProps) {
  return (
    <Card className={cn("", cardClassName)}>
      <CardHeader>
        <CardTitle>{cardHeader}</CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription>{cardDescription}</CardDescription>
        {cardContent}
      </CardContent>
      {cardFooter && <CardFooter>{cardFooter}</CardFooter>}
    </Card>
  );
}
