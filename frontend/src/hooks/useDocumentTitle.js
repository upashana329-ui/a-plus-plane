import { useEffect } from 'react';
import { APP_NAME } from '../utils/constants';

export function useDocumentTitle(title) {
  useEffect(() => {
    const originalTitle = document.title;
    if (title && title.trim()) {
      document.title = `${title} | ${APP_NAME}`;
    } else {
      document.title = `${APP_NAME} - Smart Campus & Grievance Portal`;
    }
    return () => {
      document.title = originalTitle;
    };
  }, [title]);
}

export default useDocumentTitle;