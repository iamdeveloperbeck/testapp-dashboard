import React, { useEffect, useState } from 'react';
import { db } from '../data/firebase';
import { collection, getDocs, doc, getDoc, deleteDoc, updateDoc, onSnapshot } from 'firebase/firestore';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { saveAs } from 'file-saver';

function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [editingUserId, setEditingUserId] = useState(null);
  const [editedFirstName, setEditedFirstName] = useState('');
  const [editedLastName, setEditedLastName] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersRef = collection(db, 'Users');
        const unsubscribe = onSnapshot(usersRef, async (usersSnapshot) => {
          const usersData = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

          const usersWithCategories = await Promise.all(
            usersData.map(async (user) => {
              if (user.answers && user.answers.length > 0 && user.answers[0].questionId) {
                const firstQuestionId = user.answers[0].questionId.toString();
                const questionDocRef = doc(db, 'Questions', firstQuestionId);
                const questionDoc = await getDoc(questionDocRef);

                const category = questionDoc.exists() ? questionDoc.data().category : 'Noma\'lum';
                console.log(`User: ${user.firstName}, Category: ${category}`);
                return { ...user, category };
              }
              return { ...user, category: 'Noma\'lum' };
            })
          );

          setUsers(usersWithCategories);
        });

        return () => unsubscribe();
      } catch (error) {
        console.error('Foydalanuvchilarni olishda xato:', error);
      }
    };

    fetchUsers();
  }, []);

  const deleteUser = async (userId) => {
    try {
      await deleteDoc(doc(db, 'Users', userId));
      setUsers(users.filter(user => user.id !== userId));
    } catch (error) {
      console.error("Foydalanuvchini o'chirishda xato:", error);
    }
  };

  const startEditing = (user) => {
    setEditingUserId(user.id);
    setEditedFirstName(user.firstName);
    setEditedLastName(user.lastName);
  };

  const cancelEditing = () => {
    setEditingUserId(null);
    setEditedFirstName('');
    setEditedLastName('');
  };

  const saveEdits = async (userId) => {
    try {
      const userDoc = doc(db, 'Users', userId);
      await updateDoc(userDoc, {
        firstName: editedFirstName,
        lastName: editedLastName,
      });
      setUsers(users.map(user =>
        user.id === userId ? { ...user, firstName: editedFirstName, lastName: editedLastName } : user
      ));
      setEditingUserId(null);
    } catch (error) {
      console.error("Foydalanuvchi ma'lumotlarini yangilashda xato:", error);
    }
  };

  const generatePDF = (user) => {
    const doc = new jsPDF();
    doc.text(`Ism va familiya: ${user.firstName} ${user.lastName}`, 14, 15);
    doc.text(`Kategoriya: ${user.category}`, 14, 25);
    doc.text(`To'g'ri javoblar: ${user.correct}`, 14, 35);
    doc.text(`Noto'g'ri javoblar: ${user.incorrect}`, 14, 45);
    doc.text(`Natija: ${user.result}`, 14, 55);
    if (user.answers && user.answers.length > 0) {
      const tableColumn = ['Savol', 'Berilgan javob', 'To\'g\'ri javob', 'Holat'];
      const tableRows = [];
      user.answers.forEach(answer => {
        const answerData = [
          answer.question,
          answer.givenAnswer,
          answer.correctAnswer,
          answer.isCorrect ? 'To\'g\'ri' : 'Noto\'g\'ri'
        ];
        tableRows.push(answerData);
      });
      doc.autoTable(tableColumn, tableRows, { startY: 65 });
    }
    const fileName = `${user.firstName}_${user.lastName}_natijalari.pdf`;
    const blob = doc.output('blob');
    saveAs(blob, fileName);
  };

  return (
    <div className='w-full h-auto p-[0_20px] pb-[20px]'>
      <div className='w-full h-auto'>
        <div className='grid grid-cols-4 gap-3 md:grid-cols-1'>
          {users.map(user => (
            <div key={user.id} className='block max-w-sm p-6 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700'>
              {editingUserId === user.id ? (
                <>
                  <input
                    type="text"
                    value={editedFirstName}
                    onChange={(e) => setEditedFirstName(e.target.value)}
                    className="mb-2 p-2 border rounded w-full"
                    placeholder="Ism"
                  />
                  <input
                    type="text"
                    value={editedLastName}
                    onChange={(e) => setEditedLastName(e.target.value)}
                    className="mb-2 p-2 border rounded w-full"
                    placeholder="Familiya"
                  />
                  <button onClick={() => saveEdits(user.id)} className='focus:outline-none text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mt-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800'>Saqlash</button>
                  <button onClick={cancelEditing} className='focus:outline-none text-white bg-gray-700 hover:bg-gray-800 focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mt-2 dark:bg-gray-600 dark:hover:bg-gray-700 dark:focus:ring-gray-800'>Bekor qilish</button>
                </>
              ) : (
                <>
                  <h3 className='mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white'>{user.firstName} {user.lastName}</h3>
                  <p className='font-normal text-gray-700 dark:text-gray-400'>Kategoriya: {user.category}</p>
                  <p className='font-normal text-gray-700 dark:text-gray-400'>To'g'ri javoblar: {user.correct}</p>
                  <p className='font-normal text-gray-700 dark:text-gray-400'>Noto'g'ri javoblar: {user.incorrect}</p>
                  <p className='font-normal text-gray-700 dark:text-gray-400'>Natija: {user.result}</p>
                  <button onClick={() => generatePDF(user)} className='focus:outline-none text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mt-2 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800'>PDF Yuklab olish</button>
                  <button onClick={() => deleteUser(user.id)} className='focus:outline-none text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mt-2 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-800'>O'chirish</button>
                  <button onClick={() => startEditing(user)} className='focus:outline-none text-white bg-yellow-700 hover:bg-yellow-800 focus:ring-4 focus:ring-yellow-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mt-2 dark:bg-yellow-600 dark:hover:bg-yellow-700 dark:focus:ring-yellow-800'>Tahrirlash</button>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;