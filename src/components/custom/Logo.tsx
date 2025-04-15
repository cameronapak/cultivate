import { Link } from "wasp/client/router";
import { Sprout } from "lucide-react";

const Logo = () => {
  return (
    <Link to={"/"} className="flex items-center gap-1">
      <Sprout className="h-7 w-7" />
      <p className="text-2xl font-semibold">Cultivate</p>
    </Link>
  );
};

export default Logo;
