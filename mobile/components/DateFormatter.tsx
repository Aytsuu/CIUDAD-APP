export interface DateFormatOptions {
  format?: 'short' | 'medium' | 'long' | 'full' | 'relative' | 'monthYear' | 'time' | 'dateTime';
  locale?: string;
  includeTime?: boolean;
  customFormat?: Intl.DateTimeFormatOptions;
}

export default class DateFormatter {
  private static parseDate(dateString: string): Date | null {
    if (!dateString) return null;

    try {
      // Handle space-separated datetime by replacing with 'T'
      let safeDateString = dateString.replace(/(\d{4}-\d{2}-\d{2})\s(\d{2}:\d{2}:\d{2})/, '$1T$2');
      
      let date = new Date(safeDateString);
      
      // If first attempt fails, try parsing as YYYY-MM-DD format
      if (isNaN(date.getTime())) {
        const [datePart] = dateString.split(" ");
        const [year, month, day] = datePart.split("-");
        
        if (year && month && day) {
          date = new Date(`${year}-${month}-${day}`);
        }
      }
      
      // If still invalid, try other common formats
      if (isNaN(date.getTime())) {
        // Try MM/DD/YYYY format
        const mmddyyyy = dateString.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
        if (mmddyyyy) {
          date = new Date(`${mmddyyyy[3]}-${mmddyyyy[1].padStart(2, '0')}-${mmddyyyy[2].padStart(2, '0')}`);
        }
        
        // Try DD/MM/YYYY format
        const ddmmyyyy = dateString.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
        if (ddmmyyyy && isNaN(date.getTime())) {
          date = new Date(`${ddmmyyyy[3]}-${ddmmyyyy[2].padStart(2, '0')}-${ddmmyyyy[1].padStart(2, '0')}`);
        }
      }
      
      return isNaN(date.getTime()) ? null : date;
    } catch (error) {
      return null;
    }
  }

  private static getRelativeTime(date: Date, locale: string = 'en-US'): string {
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInSeconds = Math.floor(diffInMs / 1000);
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInSeconds < 60) {
      return 'Just now';
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
    } else if (diffInDays === 1) {
      return 'Yesterday';
    } else if (diffInDays < 7) {
      return `${diffInDays} days ago`;
    } else {
      return date.toLocaleDateString(locale, { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      });
    }
  }

  /**
   * Format a date string with various options
   * @param dateString - The date string to format
   * @param options - Formatting options
   * @returns Formatted date string
   */
  static format(dateString: string, options: DateFormatOptions = {}): string {
    const {
      format = 'medium',
      locale = 'en-US',
      includeTime = false,
      customFormat
    } = options;

    const date = this.parseDate(dateString);
    
    if (!date) {
      return 'Invalid date';
    }

    // If custom format is provided, use it
    if (customFormat) {
      return date.toLocaleDateString(locale, customFormat);
    }

    switch (format) {
      case 'short':
        return date.toLocaleDateString(locale, {
          month: 'numeric',
          day: 'numeric',
          year: '2-digit'
        });

      case 'medium':
        return date.toLocaleDateString(locale, {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          ...(includeTime && {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
          })
        });

      case 'long':
        return date.toLocaleDateString(locale, {
          month: 'long',
          day: 'numeric',
          year: 'numeric',
          ...(includeTime && {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
          })
        });

      case 'full':
        return date.toLocaleDateString(locale, {
          weekday: 'long',
          month: 'long',
          day: 'numeric',
          year: 'numeric',
          ...(includeTime && {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
          })
        });

      case 'relative':
        return this.getRelativeTime(date, locale);

      case 'monthYear':
        return date.toLocaleDateString(locale, {
          month: 'short',
          year: 'numeric'
        });

      case 'time':
        return date.toLocaleTimeString(locale, {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        });

      case 'dateTime':
        return date.toLocaleString(locale, {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        });

      default:
        return date.toLocaleDateString(locale);
    }
  }

  /**
   * Quick format methods for common use cases
   */
  static short(dateString: string, locale?: string): string {
    return this.format(dateString, { format: 'short', locale });
  }

  static medium(dateString: string, locale?: string): string {
    return this.format(dateString, { format: 'medium', locale });
  }

  static long(dateString: string, locale?: string): string {
    return this.format(dateString, { format: 'long', locale });
  }

  static full(dateString: string, locale?: string): string {
    return this.format(dateString, { format: 'full', locale });
  }

  static relative(dateString: string, locale?: string): string {
    return this.format(dateString, { format: 'relative', locale });
  }

  static monthYear(dateString: string, locale?: string): string {
    return this.format(dateString, { format: 'monthYear', locale });
  }

  static time(dateString: string, locale?: string): string {
    return this.format(dateString, { format: 'time', locale });
  }

  static dateTime(dateString: string, locale?: string): string {
    return this.format(dateString, { format: 'dateTime', locale });
  }

  /**
   * Check if a date string is valid
   */
  static isValid(dateString: string): boolean {
    return this.parseDate(dateString) !== null;
  }

  /**
   * Get a Date object from a date string
   */
  static toDate(dateString: string): Date | null {
    return this.parseDate(dateString);
  }
}