import React from 'react';
import { PhoneIcon } from '@heroicons/react/24/solid';

const BusService = () => {
  const schedule = {
    "Monday to Friday": [
      {
        from: "B.I.T. Mesra",
        via: "Doranda → St. Xavier's College → Lalpur",
        time: ["05:40AM", "06:50AM", "08:00AM", "01:00PM", "03:00PM", "05:00PM"]
      },
      {
        from: "Lalpur",
        to: "B.I.T. Mesra",
        time: ["08:15AM", "01:05PM", "03:05PM", "05:05PM", "07:35PM"]
      }
    ],
    "Saturday": [
      {
        from: "B.I.T. Mesra",
        via: "Doranda → St. Xavier's College → Lalpur",
        time: ["05:40AM", "06:50AM", "08:00AM", "01:00PM", "03:00PM", "05:00PM"]
      },
      {
        from: "Lalpur",
        to: "B.I.T. Mesra",
        time: ["07:05AM", "01:05PM", "03:05PM", "05:05PM", "07:35PM"]
      }
    ],
    "Sunday & Holidays": [
      {
        from: "B.I.T. Mesra",
        via: "Doranda → St. Xavier's College → Lalpur",
        time: ["09:10AM", "01:00PM", "05:00PM"]
      },
      {
        from: "Lalpur",
        to: "B.I.T. Mesra",
        time: ["07:35PM"]
      }
    ],
    "Student Bus (Mon–Sun)": [
      {
        from: "B.I.T. Mesra",
        stops: "St. Xavier's / Lalpur",
        time: ["11:00AM (via Ring Road)", "03:00PM", "05:30PM"]
      },
      {
        from: "St. Xavier's College",
        to: "B.I.T. Mesra",
        time: ["12:00PM", "03:35PM", "05:30PM", "07:00PM"]
      },
      {
        from: "Lalpur",
        to: "B.I.T. Mesra",
        time: ["12:05PM", "03:35PM", "05:35PM", "07:05PM"]
      }
    ]
  };
  return (
    <div style={styles.container} className='relative pt-[65px]'>
      <div className='flex justify-center absolute inset-0 -z-10 min-h-screen w-full bg-custom-color bg-[radial-gradient(circle_at_60%_40%,#fce8d5_0%,#fef2e3_50%,#fff8ef_100%)]' style={{ pointerEvents: "none", zIndex: -1 }}></div>
      <div className="flex flex-col items-center bg-slate-200 p-6 shadow-lg rounded-lg w-full mb-1 mt-10">
        <h1 className="text-2xl font-semibold" style={{ fontFamily: "monospace" }}>
          BIT Bus Schedule
        </h1>
        <div className="flex items-center mt-2 text-gray-700 text-sm">
          <PhoneIcon className="w-4 h-4 text-blue-600 mr-2" />
          <span>Contact Transport Office: +91-XXXXXXXXXX</span>
        </div>
      </div>

      <span className="absolute mt-3 right-10 text-red-600 font-medium italic text-sm">
        * Timings are subject to change. Please confirm with the bus conductor or the transport office before traveling.
      </span>

      {Object.entries(schedule).map(([day, entries]) => (
        <div key={day} style={styles.section}>
          <h2 style={styles.dayTitle}>{day}</h2>
          {entries.map((entry, index) => (
            <div key={index} className='bg-slate-200' style={styles.card}>
              <div>
                <p><strong>From:</strong> {entry.from}</p>
                {entry.to && <p><strong>To:</strong> {entry.to}</p>}
                {entry.via && <p><strong>Via:</strong> {entry.via}</p>}
                {entry.stops && <p><strong>Stops:</strong> {entry.stops}</p>}
              </div>
              <div style={styles.timeBlock}>
                <p style={styles.timeLabel}>Time:</p>
                <div style={styles.timeGrid}>
                  {entry.time.map((t, i) => (
                    <span key={i} style={styles.timeTag}>{t}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

const styles = {
  container: {
    padding: '40px',
    fontFamily: '"Segoe UI", sans-serif',
    minHeight: '100vh'
  },
  section: {
    marginBottom: '40px'
  },
  dayTitle: {
    fontSize: '24px',
    color: '#3b82f6',
    marginBottom: '20px',
    borderBottom: '2px solid #3b82f6',
    paddingBottom: '5px'
  },
  card: {
    padding: '20px',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    marginBottom: '20px'
  },
  timeBlock: {
    marginTop: '10px'
  },
  timeLabel: {
    fontWeight: '600',
    color: '#374151',
    marginBottom: '8px'
  },
  timeGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '10px'
  },
  timeTag: {
    backgroundColor: '#3b82f6',
    color: '#fff',
    padding: '6px 12px',
    borderRadius: '20px',
    fontSize: '14px',
    fontWeight: '500'
  }
};



export default BusService;