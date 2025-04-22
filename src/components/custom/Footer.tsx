import { Button } from "../ui/button";

export function Footer() {
  return (
    <footer className="flex flex-col items-center justify-center gap-2">
      <div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 [&_a]:hover:text-primary">
        {new Date().getFullYear()} &copy; FAITH TOOLS SOFTWARE SOLUTIONS, LLC
      </div>
      <div className="flex flex-row items-center text-xs uppercase">
        <Button asChild variant="link" size="sm" className="text-muted-foreground font-normal">
          <a target="_blank" href="https://go.faith.tools/cultivate-tos">
            Terms
          </a>
        </Button>
        <Button asChild variant="link" size="sm" className="text-muted-foreground font-normal">
          <a target="_blank" href="https://go.faith.tools/cultivate-privacy">
            Privacy
          </a>
        </Button>
        <Button asChild variant="link" size="sm" className="text-muted-foreground font-normal">
          <a target="_blank" href="https://git.new/cultivate">
            GitHub
          </a>
        </Button>
        <Button asChild variant="link" size="sm" className="text-muted-foreground font-normal">
          <a target="_blank" href="mailto:cam@cultivatepkm.com">
            Contact
          </a>
        </Button>
      </div>
    </footer>
  );
}