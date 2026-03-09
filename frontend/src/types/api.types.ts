// API response types

export interface AjaxResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
}

export interface WordPressGlobals {
  ajaxurl: string;
  nonce?: string;
  get_address?: string;
  admin_ajax?: string;
  formatNoMatches?: string;
  phone_error?: string;
  loading_text?: string;
  loadaddress_error?: string;
  [key: string]: unknown;
}

export {};
