export interface ResponseData {
  status: number;
  message: string;
  redirectUrl?: string;
}

export interface ExtendedProps {
  className?: string;
  children?: React.ReactNode;
}
