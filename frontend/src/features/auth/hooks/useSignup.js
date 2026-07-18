import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useDispatch } from 'react-redux';
import { toast } from 'sonner';
import authService from '../services/auth.service';
import { ROUTES } from '@/constants';
import { generateAvatars } from '../utils/avatarGenerator';

/**
 * Custom hook to manage signup flow state and logic
 */
export const useSignup = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // Step management
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;
  
  // Form data accumulator
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    fullName: '',
    avatar: '',
  });
  
  // Avatar management
  const [avatars, setAvatars] = useState(() => generateAvatars(24));
  const [selectedAvatar, setSelectedAvatar] = useState(null);
  
  // Loading state
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * Navigate to next step
   */
  const goToNextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  /**
   * Navigate to previous step
   */
  const goToPreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  /**
   * Update form data for a specific step
   */
  const updateFormData = (stepData) => {
    setFormData((prev) => ({ ...prev, ...stepData }));
  };

  /**
   * Generate new set of avatars
   */
  const regenerateAvatars = () => {
    const newAvatars = generateAvatars(24, `refresh-${Date.now()}`);
    setAvatars(newAvatars);
    setSelectedAvatar(null);
    setFormData((prev) => ({ ...prev, avatar: '' }));
  };

  /**
   * Select an avatar
   */
  const selectAvatar = (avatar) => {
    setSelectedAvatar(avatar);
    setFormData((prev) => ({ ...prev ,avatar: avatar.url }));
  };

  /**
   * Submit the complete signup form
   */
  const submitSignup = async () => {
    setIsSubmitting(true);
    
    try {
      const payload = {
        username: formData.username,
        password: formData.password,
        fullName: formData.fullName,
        avatar: formData.avatar,
      };
      
      await authService.signup(dispatch, payload);
      
      toast.success('Welcome aboard! 🎉', {
        description: 'Your account has been created successfully.',
      });
      
      navigate(ROUTES.DASHBOARD, { replace: true });
    } catch (error) {
      const message =
        error?.response?.data?.message || 'Signup failed. Please try again.';
      toast.error('Signup Failed', {
        description: message,
      });
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    // Step management
    currentStep,
    totalSteps,
    goToNextStep,
    goToPreviousStep,
    
    // Form data
    formData,
    updateFormData,
    
    // Avatar management
    avatars,
    selectedAvatar,
    selectAvatar,
    regenerateAvatars,
    
    // Submission
    isSubmitting,
    submitSignup,
  };
};
