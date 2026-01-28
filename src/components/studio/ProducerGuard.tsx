import { ReactNode, useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useProducerApplication } from '@/hooks/useProducerApplication';
import { CreatorApplicationIntro } from './CreatorApplicationIntro';
import { CreatorApplicationForm } from './CreatorApplicationForm';
import { CreatorApplicationSuccess } from './CreatorApplicationSuccess';
import { ApplicationStatus } from './ApplicationStatus';
import { Loader2 } from 'lucide-react';

interface ProducerGuardProps {
  children: ReactNode;
}

type ApplicationStep = 'intro' | 'form' | 'success';

export function ProducerGuard({ children }: ProducerGuardProps) {
  const [searchParams] = useSearchParams();
  const { application, isProducer, loading, submitApplication, refetch } = useProducerApplication();
  const [step, setStep] = useState<ApplicationStep>('intro');
  const [showSuccess, setShowSuccess] = useState(false);

  // Handle reapply flow
  const isReapply = searchParams.get('reapply') === 'true';

  useEffect(() => {
    if (isReapply && application?.status === 'rejected') {
      setStep('intro');
    }
  }, [isReapply, application?.status]);

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

  // Show success screen after submission
  if (showSuccess) {
    return (
      <div className="container max-w-4xl py-8 px-4">
        <CreatorApplicationSuccess />
      </div>
    );
  }

  // User has pending application (and not reapplying)
  if (application?.status === 'pending') {
    return (
      <div className="container max-w-4xl py-8 px-4">
        <ApplicationStatus application={application} />
      </div>
    );
  }

  // User has rejected application (and not reapplying)
  if (application?.status === 'rejected' && !isReapply) {
    const handleReapply = () => {
      setStep('intro');
      // We need to handle reapply in the hook
    };
    
    return (
      <div className="container max-w-4xl py-8 px-4">
        <ApplicationStatus application={application} onReapply={() => setStep('intro')} />
      </div>
    );
  }

  // Application flow
  const handleSubmit = async (data: {
    company_name: string;
    description: string;
    portfolio_url?: string;
    primary_platform?: string;
    content_categories?: string[];
  }) => {
    await submitApplication(data);
    setShowSuccess(true);
  };

  return (
    <div className="container max-w-4xl py-8 px-4">
      {step === 'intro' && (
        <CreatorApplicationIntro onContinue={() => setStep('form')} />
      )}
      {step === 'form' && (
        <CreatorApplicationForm 
          onSubmit={handleSubmit} 
          onBack={() => setStep('intro')}
        />
      )}
    </div>
  );
}