const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

const User = require('./models/User');
const Department = require('./models/Department');
const Complaint = require('./models/Complaint');
const Notification = require('./models/Notification');
const EmailLog = require('./models/EmailLog');

const UPLOADS_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Initial realistic seed dataset
const initialSeedData = {
  users: [
    {
      id: 'usr_student_1',
      name: 'Alex Johnson',
      email: 'student@college.edu',
      password: 'password123',
      role: 'student',
      rollNo: 'CS-2024-042',
      department: 'Computer Science',
      phone: '+1 (555) 234-5678',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
    },
    {
      id: 'usr_student_2',
      name: 'Priya Sharma',
      email: 'priya@college.edu',
      password: 'password123',
      role: 'student',
      rollNo: 'EC-2024-118',
      department: 'Electronics & Comm',
      phone: '+1 (555) 876-5432',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80'
    },
    {
      id: 'usr_admin_1',
      name: 'Dean Martinez',
      email: 'admin@college.edu',
      password: 'admin123',
      role: 'admin',
      title: 'Head of Campus Operations',
      department: 'Administration',
      phone: '+1 (555) 999-0001',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
    },
    {
      id: 'usr_staff_wifi',
      name: 'David Vance (IT Lead)',
      email: 'wifi.support@college.edu',
      password: 'staff123',
      role: 'staff',
      department: 'IT & Wi-Fi Support',
      title: 'Senior Network Engineer',
      phone: '+1 (555) 301-4455',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80'
    },
    {
      id: 'usr_staff_hostel',
      name: 'Mrs. Rebecca Sterling',
      email: 'hostel.warden@college.edu',
      password: 'staff123',
      role: 'staff',
      department: 'Hostel Maintenance',
      title: 'Hostel Warden & Facilities Supervisor',
      phone: '+1 (555) 302-8877',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
    },
    {
      id: 'usr_staff_infra',
      name: 'Robert Chang (Civil & Infra)',
      email: 'infra.works@college.edu',
      password: 'staff123',
      role: 'staff',
      department: 'Campus Infrastructure',
      title: 'Chief Facilities Officer',
      phone: '+1 (555) 303-6622',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80'
    }
  ],
  departments: [
    { id: 'dept_it', name: 'IT & Wi-Fi Support', lead: 'David Vance (IT Lead)', email: 'wifi.support@college.edu', icon: 'wifi' },
    { id: 'dept_hostel', name: 'Hostel Maintenance', lead: 'Mrs. Rebecca Sterling', email: 'hostel.warden@college.edu', icon: 'home' },
    { id: 'dept_infra', name: 'Campus Infrastructure', lead: 'Robert Chang', email: 'infra.works@college.edu', icon: 'tool' },
    { id: 'dept_clean', name: 'Cleanliness & Sanitation', lead: 'Samuel Green', email: 'sanitation@college.edu', icon: 'trash-2' },
    { id: 'dept_transport', name: 'Transportation', lead: 'Capt. Roger Miller', email: 'transport@college.edu', icon: 'truck' },
    { id: 'dept_library', name: 'Library Facilities', lead: 'Dr. Clara Oswald', email: 'library@college.edu', icon: 'book' },
    { id: 'dept_cafeteria', name: 'Cafeteria & Dining', lead: 'Chef Marco Rossi', email: 'dining@college.edu', icon: 'coffee' },
    { id: 'dept_lab', name: 'Laboratories & Equipment', lead: 'Prof. Alan Grant', email: 'labs@college.edu', icon: 'flask-conical' }
  ],
  complaints: [
    {
      id: 'CMP-1001',
      title: 'High-speed Wi-Fi not working on Hostel Block B, 3rd Floor',
      category: 'Wi-Fi & IT',
      priority: 'High',
      status: 'In Progress',
      location: 'Hostel Block B, 3rd Floor Corridor & Rooms 301-315',
      description: 'The Wi-Fi access point AP-B3 has been blinking red since yesterday morning. Students cannot connect or submit online assignments for mid-term exams. Signal drops entirely.',
      studentId: 'usr_student_1',
      studentName: 'Alex Johnson',
      studentRollNo: 'CS-2024-042',
      studentEmail: 'student@college.edu',
      assignedDepartment: 'IT & Wi-Fi Support',
      assignedStaff: 'David Vance (IT Lead)',
      assignedStaffEmail: 'wifi.support@college.edu',
      createdAt: new Date('2026-08-23T10:15:00.000Z'),
      updatedAt: new Date('2026-08-24T14:30:00.000Z'),
      attachmentUrl: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=600&auto=format&fit=crop&q=80',
      timeline: [
        {
          status: 'Submitted',
          timestamp: new Date('2026-08-23T10:15:00.000Z'),
          actor: 'Alex Johnson (Student)',
          comment: 'Complaint registered by student.'
        },
        {
          status: 'Under Review',
          timestamp: new Date('2026-08-23T11:45:00.000Z'),
          actor: 'Dean Martinez (Admin)',
          comment: 'Reviewed priority. Acknowledged issue impacting mid-term submissions.'
        },
        {
          status: 'Assigned',
          timestamp: new Date('2026-08-23T12:30:00.000Z'),
          actor: 'Dean Martinez (Admin)',
          comment: 'Assigned ticket to IT & Wi-Fi Support (Lead: David Vance).'
        },
        {
          status: 'In Progress',
          timestamp: new Date('2026-08-24T14:30:00.000Z'),
          actor: 'David Vance (IT Lead)',
          comment: 'Technician dispatched to replace the failed switch port and re-terminate the fiber uplink.'
        }
      ],
      comments: [
        {
          id: 'comm_1',
          author: 'David Vance (IT Lead)',
          authorRole: 'staff',
          text: 'We found a blown POE power injector for AP-B3. Replacement part is being installed today by 4 PM.',
          timestamp: new Date('2026-08-24T14:35:00.000Z')
        },
        {
          id: 'comm_2',
          author: 'Alex Johnson',
          authorRole: 'student',
          text: 'Thank you for the quick update David! Looking forward to testing once reconnected.',
          timestamp: new Date('2026-08-24T15:10:00.000Z')
        }
      ],
      resolutionDetails: null,
      feedback: null
    },
    {
      id: 'CMP-1002',
      title: 'Water leakage in Chemistry Lab 2 ceiling near reagent shelf',
      category: 'Laboratories',
      priority: 'Critical',
      status: 'Assigned',
      location: 'Science Building, 2nd Floor, Chem Lab 2',
      description: 'Continuous water dripping from the roof overhead near Chemical Storage Rack #3. Potential hazard if chemicals come in contact with water. Needs immediate plumbing attention.',
      studentId: 'usr_student_2',
      studentName: 'Priya Sharma',
      studentRollNo: 'EC-2024-118',
      studentEmail: 'priya@college.edu',
      assignedDepartment: 'Campus Infrastructure',
      assignedStaff: 'Robert Chang (Civil & Infra)',
      assignedStaffEmail: 'infra.works@college.edu',
      createdAt: new Date('2026-08-24T09:00:00.000Z'),
      updatedAt: new Date('2026-08-24T09:45:00.000Z'),
      attachmentUrl: 'https://images.unsplash.com/photo-1584467735871-8e85353a8413?w=600&auto=format&fit=crop&q=80',
      timeline: [
        {
          status: 'Submitted',
          timestamp: new Date('2026-08-24T09:00:00.000Z'),
          actor: 'Priya Sharma (Student)',
          comment: 'Emergency safety complaint filed.'
        },
        {
          status: 'Under Review',
          timestamp: new Date('2026-08-24T09:20:00.000Z'),
          actor: 'Dean Martinez (Admin)',
          comment: 'Safety hazard validated. Priority raised to Critical.'
        },
        {
          status: 'Assigned',
          timestamp: new Date('2026-08-24T09:45:00.000Z'),
          actor: 'Dean Martinez (Admin)',
          comment: 'Assigned with urgent SLA to Campus Infrastructure.'
        }
      ],
      comments: [
        {
          id: 'comm_3',
          author: 'Robert Chang (Civil & Infra)',
          authorRole: 'staff',
          text: 'Lab assistant has cordoned off Rack #3. Plumber team is isolating the 3rd-floor overhead valve now.',
          timestamp: new Date('2026-08-24T10:00:00.000Z')
        }
      ],
      resolutionDetails: null,
      feedback: null
    },
    {
      id: 'CMP-1003',
      title: 'Broken ceiling fans and faulty smart projector in Hall 104',
      category: 'Classrooms',
      priority: 'Medium',
      status: 'Resolved',
      location: 'Engineering Block 1, Room 104 (Lecture Hall)',
      description: 'Two ceiling fans are making loud screeching noises and the HDMI projector keeps flickering every few seconds during lectures.',
      studentId: 'usr_student_1',
      studentName: 'Alex Johnson',
      studentRollNo: 'CS-2024-042',
      studentEmail: 'student@college.edu',
      assignedDepartment: 'Campus Infrastructure',
      assignedStaff: 'Robert Chang (Civil & Infra)',
      assignedStaffEmail: 'infra.works@college.edu',
      createdAt: new Date('2026-08-20T08:30:00.000Z'),
      updatedAt: new Date('2026-08-22T16:00:00.000Z'),
      attachmentUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=600&auto=format&fit=crop&q=80',
      timeline: [
        {
          status: 'Submitted',
          timestamp: new Date('2026-08-20T08:30:00.000Z'),
          actor: 'Alex Johnson (Student)',
          comment: 'Complaint submitted.'
        },
        {
          status: 'Under Review',
          timestamp: new Date('2026-08-20T10:00:00.000Z'),
          actor: 'Dean Martinez (Admin)',
          comment: 'Approved for maintenance.'
        },
        {
          status: 'Assigned',
          timestamp: new Date('2026-08-20T11:15:00.000Z'),
          actor: 'Dean Martinez (Admin)',
          comment: 'Assigned to Campus Infrastructure.'
        },
        {
          status: 'In Progress',
          timestamp: new Date('2026-08-21T09:00:00.000Z'),
          actor: 'Robert Chang (Civil & Infra)',
          comment: 'Electrician lubricated bearings and replaced HDMI transceiver cable.'
        },
        {
          status: 'Resolved',
          timestamp: new Date('2026-08-22T16:00:00.000Z'),
          actor: 'Robert Chang (Civil & Infra)',
          comment: 'Both fans serviced and tested quietly. New 4K HDMI cable installed and tested.'
        }
      ],
      comments: [
        {
          id: 'comm_4',
          author: 'Robert Chang (Civil & Infra)',
          authorRole: 'staff',
          text: 'Repairs completed on Aug 22. Faculty in Room 104 verified the display.',
          timestamp: new Date('2026-08-22T16:05:00.000Z')
        }
      ],
      resolutionDetails: {
        resolvedBy: 'Robert Chang (Civil & Infra)',
        resolvedAt: new Date('2026-08-22T16:00:00.000Z'),
        summary: 'Replaced ball bearings on ceiling fan #1 and replaced HDMI wall input plate with shielded cable.',
        actionTaken: 'Electrical maintenance & AV cable replacement completed.'
      },
      feedback: {
        rating: 5,
        review: 'Super quick resolution! The lecture hall is much quieter now and slides show up crystal clear.',
        submittedAt: new Date('2026-08-23T09:15:00.000Z')
      }
    },
    {
      id: 'CMP-1004',
      title: 'Trash bin overflow and unsanitary restroom in Cafeteria East Wing',
      category: 'Cleanliness',
      priority: 'High',
      status: 'Submitted',
      location: 'Central Cafeteria, East Wing Ground Floor Restroom Area',
      description: 'The recycling and food waste bins have not been cleared since noon and the hand soap dispenser is empty.',
      studentId: 'usr_student_2',
      studentName: 'Priya Sharma',
      studentRollNo: 'EC-2024-118',
      studentEmail: 'priya@college.edu',
      assignedDepartment: null,
      assignedStaff: null,
      assignedStaffEmail: null,
      createdAt: new Date('2026-08-25T11:20:00.000Z'),
      updatedAt: new Date('2026-08-25T11:20:00.000Z'),
      attachmentUrl: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=600&auto=format&fit=crop&q=80',
      timeline: [
        {
          status: 'Submitted',
          timestamp: new Date('2026-08-25T11:20:00.000Z'),
          actor: 'Priya Sharma (Student)',
          comment: 'Complaint lodged by student.'
        }
      ],
      comments: [],
      resolutionDetails: null,
      feedback: null
    },
    {
      id: 'CMP-1005',
      title: 'College Route #4 bus AC malfunctioning during afternoon transit',
      category: 'Transportation',
      priority: 'Low',
      status: 'Closed',
      location: 'Campus Bus Stand / Route #4 North Campus Shuttle',
      description: 'The air conditioning in Bus #4 blows warm air. With peak heat in the afternoon, it gets uncomfortable for passengers.',
      studentId: 'usr_student_1',
      studentName: 'Alex Johnson',
      studentRollNo: 'CS-2024-042',
      studentEmail: 'student@college.edu',
      assignedDepartment: 'Transportation',
      assignedStaff: 'Capt. Roger Miller',
      assignedStaffEmail: 'transport@college.edu',
      createdAt: new Date('2026-08-18T14:10:00.000Z'),
      updatedAt: new Date('2026-08-21T18:00:00.000Z'),
      attachmentUrl: null,
      timeline: [
        { status: 'Submitted', timestamp: new Date('2026-08-18T14:10:00.000Z'), actor: 'Alex Johnson (Student)', comment: 'Reported AC issue.' },
        { status: 'Under Review', timestamp: new Date('2026-08-18T15:30:00.000Z'), actor: 'Dean Martinez (Admin)', comment: 'Forwarded to fleet manager.' },
        { status: 'Assigned', timestamp: new Date('2026-08-19T09:00:00.000Z'), actor: 'Dean Martinez (Admin)', comment: 'Assigned to Transportation team.' },
        { status: 'In Progress', timestamp: new Date('2026-08-19T11:00:00.000Z'), actor: 'Capt. Roger Miller', comment: 'Bus sent for AC gas refill and compressor check.' },
        { status: 'Resolved', timestamp: new Date('2026-08-20T17:00:00.000Z'), actor: 'Capt. Roger Miller', comment: 'Cooling gas refilled. AC cooling down to 21°C verified.' },
        { status: 'Closed', timestamp: new Date('2026-08-21T18:00:00.000Z'), actor: 'Alex Johnson (Student)', comment: 'Verified working comfortably on today commute. Ticket closed.' }
      ],
      comments: [],
      resolutionDetails: {
        resolvedBy: 'Capt. Roger Miller',
        resolvedAt: new Date('2026-08-20T17:00:00.000Z'),
        summary: 'AC refrigerant refilled and cabin filters cleaned.',
        actionTaken: 'Maintenance servicing completed at college garage.'
      },
      feedback: {
        rating: 4,
        review: 'Fixed within two days. Thank you transport team!',
        submittedAt: new Date('2026-08-21T18:00:00.000Z')
      }
    }
  ],
  notifications: [
    {
      id: 'notif_1',
      userId: 'usr_student_1',
      title: 'Status Updated: Wi-Fi Issue In Progress',
      message: 'Your complaint CMP-1001 status changed to "In Progress". David Vance is handling the repair.',
      complaintId: 'CMP-1001',
      read: false,
      timestamp: new Date('2026-08-24T14:30:00.000Z')
    },
    {
      id: 'notif_2',
      userId: 'usr_student_1',
      title: 'Complaint Resolved: Lecture Hall 104',
      message: 'Your complaint CMP-1003 has been marked as Resolved. Please share your rating and feedback.',
      complaintId: 'CMP-1003',
      read: true,
      timestamp: new Date('2026-08-22T16:00:00.000Z')
    },
    {
      id: 'notif_3',
      userId: 'usr_admin_1',
      title: 'New Complaint Filed: Cafeteria Cleanliness',
      message: 'Priya Sharma submitted a High priority complaint (CMP-1004) regarding Cafeteria Cleanliness.',
      complaintId: 'CMP-1004',
      read: false,
      timestamp: new Date('2026-08-25T11:20:00.000Z')
    }
  ],
  emailLogs: [
    {
      id: 'eml_1',
      to: 'student@college.edu',
      recipientName: 'Alex Johnson',
      subject: '[College Portal] Update on Complaint #CMP-1001',
      body: 'Hello Alex, your complaint "High-speed Wi-Fi not working on Hostel Block B, 3rd Floor" has been assigned to IT & Wi-Fi Support (David Vance). Work is currently In Progress.',
      sentAt: new Date('2026-08-24T14:30:00.000Z'),
      complaintId: 'CMP-1001'
    },
    {
      id: 'eml_2',
      to: 'student@college.edu',
      recipientName: 'Alex Johnson',
      subject: '[College Portal] Issue Resolved: #CMP-1003',
      body: 'Hello Alex, your complaint regarding "Broken ceiling fans and faulty smart projector in Hall 104" has been resolved by Campus Infrastructure. Please take 30 seconds to rate the resolution.',
      sentAt: new Date('2026-08-22T16:00:00.000Z'),
      complaintId: 'CMP-1003'
    }
  ]
};

// Seed MongoDB if empty
async function seedDatabaseIfEmpty() {
  try {
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('🌱 Seeding initial Users into MongoDB...');
      await User.insertMany(initialSeedData.users);
    }

    const deptCount = await Department.countDocuments();
    if (deptCount === 0) {
      console.log('🌱 Seeding initial Departments into MongoDB...');
      await Department.insertMany(initialSeedData.departments);
    }

    const complaintCount = await Complaint.countDocuments();
    if (complaintCount === 0) {
      console.log('🌱 Seeding initial Complaints into MongoDB...');
      await Complaint.insertMany(initialSeedData.complaints);
    }

    const notifCount = await Notification.countDocuments();
    if (notifCount === 0) {
      console.log('🌱 Seeding initial Notifications into MongoDB...');
      await Notification.insertMany(initialSeedData.notifications);
    }

    const emailCount = await EmailLog.countDocuments();
    if (emailCount === 0) {
      console.log('🌱 Seeding initial EmailLogs into MongoDB...');
      await EmailLog.insertMany(initialSeedData.emailLogs);
    }
  } catch (err) {
    console.error('Error during database seeding:', err);
  }
}

// Connect to MongoDB
async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.warn('⚠️ MONGODB_URI is not set in .env');
    return false;
  }

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 6000
    });
    console.log('🌿 Connected successfully to MongoDB Atlas database!');
    await seedDatabaseIfEmpty();
    return true;
  } catch (err) {
    console.error('❌ MongoDB Connection Error:', err.message);
    console.log('ℹ️ Tip: Check if your MongoDB Atlas username in .env matches your database user in Atlas.');
    return false;
  }
}

module.exports = {
  connectDB,
  User,
  Department,
  Complaint,
  Notification,
  EmailLog,
  UPLOADS_DIR
};
