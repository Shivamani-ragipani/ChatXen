<h4>ChatXen</h4>

<p><b>ChatXen</b> is a <b>real-time chat web application</b> built using React, Firebase, and Vite. It allows users to send messages and share images in real-time. 
The application supports user authentication, message storage, and real-time updates for a seamless chatting experience.</p>

<h3>Features</h3>

<b>Real-time Chat</b>: Send and receive messages instantly.
<b>Image Sharing:</b> Share images directly in the chat.
**User Authentication**: Sign up and log in using Firebase Authentication.
**Responsive Design**: Fully responsive UI that works well on all screen sizes.
**Message Persistence**: Messages are stored in Firebase and persist even after refreshing the page.

<h3>Technologies Used</h3>

<h2>Frontend<h2>:
  - React
  - Vite
  - Firebase (Firestore, Authentication, Storage)
  - React Context API
  - React Hooks
  - CSS (Custom styles)
  - Bootstrap

<h2>Backend</h2>:
  - Firebase (Firestore for real-time message storage)

<h3>Installation</h3>

<h2>Prerequisites</h2>

- Node.js (>=14.x)
- npm or yarn

### Steps to Run the Project Locally

1. Clone the repository to your local machine:

   ```bash
   git clone https://github.com/Shivamani-ragipani/ChatXen.git
Navigate to the project directory:

bash
Copy
Edit
cd ChatXen
Install the dependencies:

If you are using npm:

bash
Copy
Edit
npm install
Or, if you are using yarn:

bash
Copy
Edit
yarn install
Set up Firebase

Go to Firebase Console.
Create a new project or use an existing one.
Set up Firebase Authentication, Firestore, and Storage.
Download the Firebase config file and paste it into your src/config/firebase.js.
Run the app locally:

bash
Copy
Edit
npm run dev
Or:

bash
Copy
Edit
yarn dev
Visit http://localhost:3000 to see the app in action.

Usage
Login/Register: Upon loading the app, you'll be prompted to log in or register using Firebase Authentication.
Start Chatting: After logging in, select a user from the list and start chatting. You can send text messages and images.
Messages: All messages are stored and displayed in real-time.

<h4>Screenshots:</h4>




License
This project is licensed under the MIT License - see the LICENSE file for details.

Acknowledgments
Thanks to Firebase for providing the backend infrastructure.
Thanks to Vite for its lightning-fast build tool.
