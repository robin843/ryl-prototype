import { ReactNode } from 'react';
import { useProducerApplication } from '@/hooks/useProducerApplication';
import { ProducerApplicationForm } from './ProducerApplicationForm';
import { ApplicationStatus } from './ApplicationStatus';
import { Loader2 } from 'lucide-react';

interface ProducerGuardProps {
  children: ReactNode;
}

export function ProducerGuard({ children }: ProducerGuardProps) {
  const { application, isProducer, loading, submitApplication } = useProducerApplication();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // User is verified producer - show full studio
  if (isProducer) {
    return <>{children}</>;
  }

  // User has pending or rejected application
  if (application) {
    return (
      <div className="container max-w-4xl py-8 px-4">
        <ApplicationStatus application={application} />
      </div>
    );
  }

  // No application yet - show application form
  return (
    <div className="container max-w-4xl py-8 px-4">
      <ProducerApplicationForm onSubmit={submitApplication} />
    </div>
  );
}
