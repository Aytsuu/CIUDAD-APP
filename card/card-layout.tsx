import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../card";
import { cn } from "@/lib/utils";

type CardProps = {
  title?: React.ReactNode; 
  description?: React.ReactNode;
  content: React.ReactNode;
  cardClassName?: string;
  titleClassName?: string;
  headerClassName?: string;
  contentClassName?: string;
};

export default function CardLayout({
  title,
  description,
  content,
  cardClassName,
  titleClassName,
  headerClassName,
  contentClassName
}: CardProps) {
  return (
    <Card className={cn("", cardClassName)}>
      <CardHeader className={cn("", headerClassName)}>
        <CardTitle className={cn("", titleClassName)}>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className={cn("", contentClassName)}>
        {content}
      </CardContent>
    </Card>
  );
}