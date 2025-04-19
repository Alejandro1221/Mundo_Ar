import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "./firebaseConfig"; 

export const uploadFile = async (file, path) => {
  const storageRef = ref(storage, path);         
  await uploadBytes(storageRef, file);         
  return await getDownloadURL(storageRef);        
};
