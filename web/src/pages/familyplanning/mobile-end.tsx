// import React, { useState, useEffect } from 'react';
// import { initializeApp } from 'firebase/app';
// import { getAuth, signInWithCustomToken, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
// import { getFirestore, doc, setDoc, onSnapshot } from 'firebase/firestore';

// // DO NOT MODIFY OR DELETE. This is for the Canvas environment.
// const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
// const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
// const __initial_auth_token = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : undefined;

// const App = () => {
//   const [db, setDb] = useState(null);
//   const [auth, setAuth] = useState(null);
//   const [userId, setUserId] = useState(null);
//   const [isAuthReady, setIsAuthReady] = useState(false);
//   const [view, setView] = useState('admin');
//   const [title, setTitle] = useState('');
//   const [description, setDescription] = useState('');
//   const [content, setContent] = useState('');
//   const [isLoading, setIsLoading] = useState(false);
//   const [message, setMessage] = useState('');

//   // Initialize Firebase and set up auth listener
//   useEffect(() => {
//     try {
//       if (!firebaseConfig.apiKey) {
//         console.error("Firebase config is missing. Please provide the firebase config.");
//         return;
//       }
//       const app = initializeApp(firebaseConfig);
//       const firestore = getFirestore(app);
//       const authentication = getAuth(app);
//       setDb(firestore);
//       setAuth(authentication);

//       const unsubscribe = onAuthStateChanged(authentication, async (user) => {
//         if (user) {
//           setUserId(user.uid);
//         } else {
//           try {
//             if (__initial_auth_token) {
//               await signInWithCustomToken(authentication, __initial_auth_token);
//             } else {
//               await signInAnonymously(authentication);
//             }
//           } catch (error) {
//             console.error("Firebase auth error:", error);
//           }
//         }
//         setIsAuthReady(true);
//       });

//       return () => unsubscribe();
//     } catch (error) {
//       console.error("Failed to initialize Firebase:", error);
//     }
//   }, []);

//   // Listen for real-time content updates from Firestore
//   useEffect(() => {
//     if (db && userId) {
//       const docRef = doc(db, 'artifacts', appId, 'users', userId, 'dynamicContent', 'mobileDisplay');
//       const unsubscribe = onSnapshot(docRef, (docSnap) => {
//         if (docSnap.exists()) {
//           const data = docSnap.data();
//           setTitle(data.title || '');
//           setDescription(data.description || '');
//           setContent(data.content || '');
//         } else {
//           console.log("No such document!");
//           setTitle('');
//           setDescription('');
//           setContent('');
//         }
//       });
//       return () => unsubscribe();
//     }
//   }, [db, userId, appId]);

//   const handleSave = async (e) => {
//     e.preventDefault();
//     if (!db || !userId) {
//       setMessage('Authentication not ready. Please try again.');
//       return;
//     }

//     setIsLoading(true);
//     setMessage('');

//     const docRef = doc(db, 'artifacts', appId, 'users', userId, 'dynamicContent', 'mobileDisplay');
//     try {
//       await setDoc(docRef, {
//         title,
//         description,
//         content,
//         updatedAt: new Date().toISOString()
//       }, { merge: true });
//       setMessage('Content saved successfully!');
//     } catch (error) {
//       console.error('Error saving document:', error);
//       setMessage(`Failed to save content: ${error.message}`);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const MobilePreview = () => (
//     <div className="flex justify-center items-start pt-8 pb-4 bg-gray-100 min-h-screen">
//       <div className="bg-white shadow-xl rounded-2xl w-full max-w-sm overflow-hidden border border-gray-200 mobile-screen-mockup">
//         <div className="p-6">
//           <h1 className="text-2xl font-bold mb-2 text-gray-900 leading-snug">{title || 'Loading Title...'}</h1>
//           <p className="text-sm text-gray-500 mb-4">{description || 'Loading description...'}</p>
//           <div className="prose prose-sm max-w-none text-gray-700">
//             <p>{content || 'Loading content...'}</p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );

//   const AdminPanel = () => (
//     <form onSubmit={handleSave} className="space-y-6">
//       <h2 className="text-3xl font-bold text-gray-800 mb-6">Admin Panel</h2>
//       <div>
//         <label htmlFor="title" className="block text-sm font-medium text-gray-700">Content Title</label>
//         <div className="mt-1">
//           <input
//             id="title"
//             name="title"
//             type="text"
//             required
//             value={title}
//             onChange={(e) => setTitle(e.target.value)}
//             className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-3"
//           />
//         </div>
//       </div>
//       <div>
//         <label htmlFor="description" className="block text-sm font-medium text-gray-700">Short Description</label>
//         <div className="mt-1">
//           <input
//             id="description"
//             name="description"
//             type="text"
//             required
//             value={description}
//             onChange={(e) => setDescription(e.target.value)}
//             className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-3"
//           />
//         </div>
//       </div>
//       <div>
//         <label htmlFor="content" className="block text-sm font-medium text-gray-700">Main Content</label>
//         <div className="mt-1">
//           <textarea
//             id="content"
//             name="content"
//             rows="10"
//             required
//             value={content}
//             onChange={(e) => setContent(e.target.value)}
//             className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-3"
//           ></textarea>
//         </div>
//       </div>
//       <div className="flex items-center justify-between">
//         <button
//           type="submit"
//           disabled={isLoading || !isAuthReady}
//           className={`flex-1 mr-2 flex justify-center py-3 px-6 border border-transparent rounded-md shadow-sm text-lg font-medium text-white ${isLoading || !isAuthReady ? 'bg-indigo-300 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'}`}
//         >
//           {isLoading ? 'Saving...' : 'Save Content'}
//         </button>
//       </div>
//       {message && <p className="mt-4 text-sm text-center font-medium text-green-600">{message}</p>}
//     </form>
//   );

//   return (
//     <div className="font-sans antialiased text-gray-900 bg-gray-50 flex flex-col min-h-screen">
//       <style>{`
//         .mobile-screen-mockup {
//           box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
//           transform: perspective(1000px) rotateY(0deg) scale(0.9);
//           transition: all 0.5s ease-in-out;
//         }
//         @media (min-width: 640px) {
//           .mobile-screen-mockup {
//             height: 80vh;
//             max-width: 380px;
//           }
//         }
//       `}</style>
//       <div className="flex-grow flex flex-col sm:flex-row p-6 sm:p-10 gap-8">
//         <div className="sm:w-1/2 w-full p-6 bg-white rounded-3xl shadow-lg border border-gray-100 flex-grow">
//           <div className="flex justify-center mb-6 border-b border-gray-200 pb-4">
//             <button
//               onClick={() => setView('admin')}
//               className={`py-2 px-6 rounded-full text-lg font-medium transition-colors duration-200 ${view === 'admin' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-600 hover:text-indigo-600'}`}
//             >
//               Admin Panel
//             </button>
//             <button
//               onClick={() => setView('preview')}
//               className={`py-2 px-6 rounded-full text-lg font-medium transition-colors duration-200 ${view === 'preview' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-600 hover:text-indigo-600'}`}
//             >
//               Mobile Preview
//             </button>
//           </div>
//           {view === 'admin' ? <AdminPanel /> : <MobilePreview />}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default MobileView;
