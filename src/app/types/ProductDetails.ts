export interface Option {
    key: string;
    value: string;
  }
  
  export interface ProductFormData {
    name: string;
    price: string;
    categories: string;
    options: Option[];
    mainImage: File | null;
    otherImages: File[];
  }