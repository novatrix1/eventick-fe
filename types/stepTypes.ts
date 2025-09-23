import { EventData } from "./eventTypes";

export interface Step1Props {
  eventData: EventData;
  setEventData: React.Dispatch<React.SetStateAction<any>>;
  pickImage: () => Promise<void>;
};


export interface Step2Props {
  eventData: EventData;
  setEventData: React.Dispatch<React.SetStateAction<any>>;
  showDatePicker: boolean;
  setShowDatePicker: React.Dispatch<React.SetStateAction<boolean>>;
  showStartTimePicker: boolean;
  setShowStartTimePicker: React.Dispatch<React.SetStateAction<boolean>>;
  showEndTimePicker: boolean;
  setShowEndTimePicker: React.Dispatch<React.SetStateAction<boolean>>;
  handleDateChange: (event: any, selectedDate?: Date) => void;
  handleStartTimeChange: (event: any, selectedTime?: Date) => void;
  handleEndTimeChange: (event: any, selectedTime?: Date) => void;
  formatDate: (date: Date) => string;
  formatTime: (date: Date) => string;
}


export interface Step3Props {
  eventData: EventData;
  setEventData: React.Dispatch<React.SetStateAction<any>>;
  formatDate: (date: Date) => string;
  
};


export interface Step4Props {
  eventData: EventData;
  setEventData: React.Dispatch<React.SetStateAction<any>>;
  showPromoEndDatePicker: boolean;
  setShowPromoEndDatePicker: React.Dispatch<React.SetStateAction<boolean>>;
  handlePromoEndDateChange: (event: any, selectedDate?: Date) => void;
  formatDate: (date: Date) => string;
}

export interface Step5Props {
  ticketTypes: any[];
  setTicketTypes: React.Dispatch<React.SetStateAction<any[]>>;
  addTicketType: () => void;
  removeTicketType: (id: string) => void;
  updateTicketType: (id: string, field: string, value: any) => void;
}