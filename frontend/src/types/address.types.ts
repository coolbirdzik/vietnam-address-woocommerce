// Address data types matching PHP structure

export interface Province {
  code: string; // e.g., "HANOI", "HOCHIMINH"
  name: string; // e.g., "Ha Noi City"
}

export interface District {
  maqh: string; // District code, e.g., "00004"
  name: string; // District name
  matp: string; // Parent province code
}

export interface Ward {
  xaid: string; // Ward code, e.g., "00001"
  name: string; // Ward name
  maqh: string; // Parent district code
}

export interface AddressData {
  billing_state?: string; // Province code
  billing_city?: string; // District code
  billing_address_2?: string; // Ward code
  shipping_state?: string;
  shipping_city?: string;
  shipping_address_2?: string;
  [key: string]: string | undefined;
}

export interface AddressFormProps {
  type: 'billing' | 'shipping';
  initialValues?: Partial<AddressData>;
  onUpdate?: (values: Partial<AddressData>) => void;
}
