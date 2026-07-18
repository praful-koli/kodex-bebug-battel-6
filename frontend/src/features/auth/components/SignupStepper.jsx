import { AnimatePresence } from 'framer-motion';
import { useSignup } from '../hooks/useSignup';
import StepOne from './StepOne';
import StepTwo from './StepTwo';
import StepThree from './StepThree';

const SignupStepper = () => {
  const {
    currentStep,
    goToNextStep,
    goToPreviousStep,
    formData,
    updateFormData,
    avatars,
    selectedAvatar,
    selectAvatar,
    regenerateAvatars,
    isSubmitting,
    submitSignup,
  } = useSignup();

  const handleStepOneContinue = (data) => {
    updateFormData(data);
    goToNextStep();
  };

  const handleStepTwoContinue = (data) => {
    updateFormData(data);
    goToNextStep();
  };

  const handleStepThreeFinish = async () => {
    try {
      await submitSignup();
    } catch (error) {
      // Error handling is done in the hook
      console.error('Signup failed:', error);
    }
  };

  return (
    <div className="w-full">
      {/* Step Content */}
      <div className="min-h-[400px]">
        <AnimatePresence mode="wait">
          {currentStep === 1 && (
            <StepOne
              key="step-1"
              initialData={formData}
              onContinue={handleStepOneContinue}
            />
          )}

          {currentStep === 2 && (
            <StepTwo
              key="step-2"
              initialData={formData}
              onContinue={handleStepTwoContinue}
              onBack={goToPreviousStep}
            />
          )}

          {currentStep === 3 && (
            <StepThree
              key="step-3"
              avatars={avatars}
              selectedAvatar={selectedAvatar}
              onSelectAvatar={selectAvatar}
              onRegenerate={regenerateAvatars}
              onBack={goToPreviousStep}
              onFinish={handleStepThreeFinish}
              isSubmitting={isSubmitting}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default SignupStepper;
