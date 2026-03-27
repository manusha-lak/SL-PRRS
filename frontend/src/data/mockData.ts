export type Status =
  | "Pending"
  | "Under Investigation"
  | "Awaiting Review"
  | "Resolved"
  | "Closed"
  | "Active";

export type Report = {
  ref: string;
  type: string;
  station: string;
  date: string;
  status: Status;
  citizen?: string;
};

export type Station = {
  id: string;
  name: string;
  division: string;
  address: string;
  district: string;
  province: string;
  distance: string;
  phone: string;
  services: string[];
};

export const citizenUser = {
  name: "Perera, Kavindu M.",
  nic: "199834502567V",
  email: "kavindu.perera@gmail.com",
  phone: "+94 77 234 5678"
};

export const officerUser = {
  name: "Inspector Jayawardena, R.K.",
  badge: "SLP-COL-4821",
  rank: "Sub Inspector",
  station: "Colombo Fort Police Station",
  division: "Colombo North"
};

export const reports: Report[] = [
  {
    ref: "SLPRS-2024-0042",
    type: "Vehicle Theft",
    station: "Colombo Fort Police Station",
    date: "2024-11-14 09:32 AM",
    status: "Under Investigation",
    citizen: "Anura Perera"
  },
  {
    ref: "SLPRS-2024-0039",
    type: "Fraud / Cheating",
    station: "Cinnamon Gardens Police Station",
    date: "2024-11-08 02:15 PM",
    status: "Pending",
    citizen: "Kamal Silva"
  },
  {
    ref: "SLPRS-2024-0031",
    type: "Assault",
    station: "Nugegoda Police Station",
    date: "2024-10-22 06:45 PM",
    status: "Resolved",
    citizen: "Ruwan J."
  },
  {
    ref: "SLPRS-2024-0028",
    type: "Property Damage",
    station: "Dehiwala Police Station",
    date: "2024-10-15 11:00 AM",
    status: "Closed",
    citizen: "Nimali S."
  }
];

export const caseTimeline = [
  { label: "Report Received", time: "2024-11-14 09:32 AM", state: "Completed" },
  { label: "Assigned to Station", time: "2024-11-14 11:00 AM", state: "Completed" },
  { label: "Under Investigation", time: "2024-11-15 08:30 AM", state: "Current" },
  { label: "Awaiting Evidence", time: "Pending", state: "Pending" },
  { label: "Update Available", time: "Pending", state: "Pending" },
  { label: "Case Resolved", time: "Pending", state: "Pending" }
] as const;

export const stations: Station[] = [
  {
    id: "colombo-fort",
    name: "Colombo Fort Police Station",
    division: "Colombo North Division",
    address: "York Street, Colombo 01",
    district: "Colombo",
    province: "Western Province",
    distance: "0.8 km",
    phone: "+94 11 242 1111",
    services: ["Incident Intake", "Crime Desk", "Community Services"]
  },
  {
    id: "cinnamon-gardens",
    name: "Cinnamon Gardens Police Station",
    division: "Colombo South Division",
    address: "Ward Place, Colombo 07",
    district: "Colombo",
    province: "Western Province",
    distance: "2.1 km",
    phone: "+94 11 269 4800",
    services: ["Complaint Handling", "Fraud Desk", "Women & Children Help"]
  },
  {
    id: "nugegoda",
    name: "Nugegoda Police Station",
    division: "Nugegoda Division",
    address: "High Level Road, Nugegoda",
    district: "Colombo",
    province: "Western Province",
    distance: "6.9 km",
    phone: "+94 11 285 1500",
    services: ["Case Intake", "Traffic Desk", "Evidence Receiving"]
  },
  {
    id: "kandy",
    name: "Kandy Police Station",
    division: "Kandy Division",
    address: "Dalada Veediya, Kandy",
    district: "Kandy",
    province: "Central Province",
    distance: "115 km",
    phone: "+94 81 222 2222",
    services: ["Incident Intake", "Special Crimes Unit", "Help Desk"]
  },
  {
    id: "galle",
    name: "Galle Police Station",
    division: "Galle Division",
    address: "Wakwella Road, Galle",
    district: "Galle",
    province: "Southern Province",
    distance: "128 km",
    phone: "+94 91 223 3445",
    services: ["Case Intake", "Evidence Desk", "Community Services"]
  }
];

export const alerts = [
  {
    ref: "SLPRS-2024-0043",
    type: "Vehicle Theft",
    citizen: "Citizen #5219",
    time: "10 mins ago",
    unread: true
  },
  {
    ref: "SLPRS-2024-0042",
    type: "Fraud",
    citizen: "Citizen #4821",
    time: "2 hours ago",
    unread: true
  },
  {
    ref: "SLPRS-2024-0040",
    type: "Assault",
    citizen: "Citizen #3341",
    time: "Yesterday 4:30 PM",
    unread: false
  }
];

export const faqItems = [
  {
    question: "How do I submit a new report?",
    answer:
      "Use the guided Submit Report flow, complete the incident details, confirm the nearest station, and upload evidence before final submission."
  },
  {
    question: "Can I track a report without logging in?",
    answer:
      "Yes. Use the Track Report page and enter the secure reference code from your official receipt."
  },
  {
    question: "How does station assignment work?",
    answer:
      "The portal resolves the nearest or selected station and routes your report to the relevant police division."
  },
  {
    question: "What files can I upload as evidence?",
    answer:
      "Images, PDF documents, and short video clips can be uploaded to support an incident report."
  }
];

export const notificationItems = [
  "Case status updates",
  "Evidence review requests",
  "Station notifications",
  "Security alerts"
];
