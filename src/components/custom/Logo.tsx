import { Link } from "wasp/client/router";
import { Sprout } from "lucide-react";
import { Badge } from "../ui/badge";

const Logo = ({ className }: { className?: string }) => {
  return (
    <Link to={"/"} className={`flex items-center gap-1 ${className}`}>
      <Sprout className="h-5 w-5" />
      <p className="text-base font-medium">Cultivate</p>
      <Badge variant="outline">Beta</Badge>
    </Link>
  );
};

export default Logo;
