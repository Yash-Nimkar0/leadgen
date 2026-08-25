export function IntentBadge({ score }: { score: number }) {
  let label = "LOW INTENT";
  let colorClass = "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
  
  if (score >= 80) {
    label = "HIGH INTENT";
    colorClass = "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
  } else if (score >= 60) {
    label = "MEDIUM INTENT";
    colorClass = "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${colorClass}`}>
      {label} ({score})
    </span>
  );
}

export function StatusBadge({ status }: { status: "NEW" | "VIEWED" | "DISMISSED" }) {
  let colorClass = "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
  
  if (status === "NEW") {
    colorClass = "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
  } else if (status === "DISMISSED") {
    colorClass = "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-500 line-through";
  }

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${colorClass}`}>
      {status}
    </span>
  );
}

export function FeedbackBadge({ feedback }: { feedback: "NONE" | "GOOD" | "BAD" | "NOT_RELEVANT" }) {
  if (feedback === "NONE") return null;

  let colorClass = "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
  let label: string = feedback;

  if (feedback === "GOOD") {
    colorClass = "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
  } else if (feedback === "BAD") {
    colorClass = "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
  } else if (feedback === "NOT_RELEVANT") {
    colorClass = "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-500";
    label = "NOT RELEVANT";
  }

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${colorClass}`}>
      {label}
    </span>
  );
}

export function OutcomeBadge({ outcome }: { outcome: "NONE" | "CONTACTED" | "CONVERTED" }) {
  if (outcome === "NONE") return null;

  let colorClass = "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";

  if (outcome === "CONTACTED") {
    colorClass = "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
  } else if (outcome === "CONVERTED") {
    colorClass = "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
  }

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${colorClass}`}>
      {outcome}
    </span>
  );
}
