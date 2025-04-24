import { Link } from "wasp/client/router";
import { Badge } from "../ui/badge";

const Logo = ({ className }: { className?: string }) => {
  return (
    <Link to={"/"} className={`flex items-center gap-2 ${className}`}>
      <svg className="!h-5 !w-fit" viewBox="0 0 864 681" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M523.259 0.422852C711.098 0.423097 863.371 152.697 863.371 340.535C863.371 528.374 755.006 680.647 567.168 680.647C526.274 680.647 443.125 680.647 408.458 613.76C387.378 680.647 343.979 680.647 309.266 680.647C278.497 680.647 249.204 680.647 223.567 642.503C195.601 680.647 177.475 680.647 152.533 680.647C65.9724 680.647 0.494751 632.972 0.494629 546.411C0.494625 480.513 75.9324 414.17 159.298 514.003C65.3848 401.539 188.469 227.724 321.346 297.943C238.163 134.818 378.111 0.422852 523.259 0.422852Z" fill="currentColor"/>
      </svg>

      <p className="text-lg font-medium">Cultivate</p>

      <Badge variant="outline">Beta</Badge>
    </Link>
  );
};

export default Logo;
