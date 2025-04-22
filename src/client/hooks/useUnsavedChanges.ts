import { useEffect } from 'react';
import { useBlocker } from 'react-router-dom';

export const useUnsavedChanges = (hasChanges: boolean) => {
  const blocker = useBlocker(hasChanges);

  useEffect(() => {
    if (blocker.state === 'blocked') {
      const shouldProceed = window.confirm(
        'You have unsaved changes. Are you sure you want to leave?'
      );
      
      if (shouldProceed) {
        blocker.proceed();
      } else {
        blocker.reset();
      }
    }
  }, [blocker]);

  // Handle browser refresh/close
  useEffect(() => {
    if (hasChanges) {
      const handleBeforeUnload = (e: BeforeUnloadEvent) => {
        e.preventDefault();
        e.returnValue = '';
        return '';
      };

      window.addEventListener('beforeunload', handleBeforeUnload);
      return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }
  }, [hasChanges]);
}; 
