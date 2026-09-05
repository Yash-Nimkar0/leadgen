import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { NewProjectWizard } from "../../../../components/NewProjectWizard";
import { Button } from "../../../../components/ui/Button";

export default function NewProjectPage() {
  return (
    <div className="p-6 md:p-12 max-w-4xl mx-auto min-h-full flex flex-col justify-center">
      <div className="mb-8">
        <Link href="/dashboard">
          <Button variant="ghost" size="sm" className="mb-6 -ml-3 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Cancel and return
          </Button>
        </Link>
        <h1 className="font-terminal text-4xl tracking-wide">Configure Pipeline</h1>
        <p className="text-muted-foreground mt-2 text-lg">
          We&apos;ll set up AI monitors to find your ideal customers.
        </p>
      </div>

      <NewProjectWizard />
    </div>
  );
}
