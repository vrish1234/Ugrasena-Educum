const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Imports
content = content.replace(
  "import { supabase } from './lib/supabase';",
  `import { db, auth, storage } from './firebase';
import { collection, doc, getDocs, getDoc, setDoc, addDoc, updateDoc, deleteDoc, query, orderBy, onSnapshot, limit } from 'firebase/firestore';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';`
);

// 2. Layout
content = content.replace(
  /const fetchSettings = async \(\) => \{[\s\S]*?fetchSettings\(\);/m,
  `const fetchSettings = async () => {
      try {
        const q = query(collection(db, 'settings'));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const s: any = {};
          querySnapshot.forEach(doc => { s[doc.id] = doc.data().value; });
          setSettings(prev => ({ ...prev, ...s }));
          localStorage.setItem('mock_settings', JSON.stringify(s));
        } else {
          const mock = localStorage.getItem('mock_settings');
          if (mock) setSettings(prev => ({ ...prev, ...JSON.parse(mock) }));
        }
      } catch (error) {
        const mock = localStorage.getItem('mock_settings');
        if (mock) setSettings(prev => ({ ...prev, ...JSON.parse(mock) }));
      }
    };
    fetchSettings();`
);

content = content.replace(
  /const channel = supabase\.channel\('layout_settings_changes'\)[\s\S]*?\}\)\.subscribe\(\);/m,
  `const unsubscribe = onSnapshot(collection(db, 'settings'), () => {
      fetchSettings();
    });`
);

content = content.replace(
  /supabase\.removeChannel\(channel\);/g,
  `if (typeof unsubscribe === 'function') unsubscribe();`
);

// 3. RegistrationForm
content = content.replace(
  /const \{ error \} = await supabase\.from\('registrations'\)\.insert\(\[\{[\s\S]*?\}\]\);[\s\S]*?if \(error\) throw error;/m,
  `await addDoc(collection(db, 'registrations'), {
        ...formData,
        created_at: new Date().toISOString()
      });`
);

// 4. ContactPage
content = content.replace(
  /const \{ data, error \} = await supabase\.from\('settings'\)\.select\('\*'\);[\s\S]*?if \(error\) throw error;[\s\S]*?if \(data && data\.length > 0\) \{[\s\S]*?data\.forEach\(item => \{ s\[item\.key\] = item\.value; \}\);/m,
  `const q = query(collection(db, 'settings'));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const s: any = {};
          querySnapshot.forEach(doc => { s[doc.id] = doc.data().value; });`
);

// 5. NoticePage
content = content.replace(
  /const \{ data, error \} = await supabase\.from\('notifications'\)\.select\('\*'\)\.order\('created_at', \{ ascending: false \}\);[\s\S]*?if \(error\) throw error;[\s\S]*?if \(data\) setNotifications\(data\);/m,
  `const q = query(collection(db, 'notifications'), orderBy('created_at', 'desc'));
        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Notification));
        setNotifications(data);`
);

content = content.replace(
  /const channel = supabase\.channel\('notice_changes'\)[\s\S]*?\}\)\.subscribe\(\);/m,
  `const unsubscribe = onSnapshot(collection(db, 'notifications'), () => {
      fetchNotifications();
    });`
);

// 6. HomePage
content = content.replace(
  /const \{ data: noticeData, error: nError \} = await supabase[\s\S]*?if \(pData\) setLatestPosts\(pData\);/m,
  `const nQ = query(collection(db, 'notifications'), orderBy('created_at', 'desc'), limit(5));
        const nSnapshot = await getDocs(nQ);
        setNotices(nSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Notification)));

        const pQ = query(collection(db, 'posts'), orderBy('created_at', 'desc'), limit(3));
        const pSnapshot = await getDocs(pQ);
        setLatestPosts(pSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Post)));`
);

// 7. GalleryPage
content = content.replace(
  /const \{ data, error \} = await supabase[\s\S]*?if \(data\) setPosts\(data\);/m,
  `const pQ = query(collection(db, 'posts'), orderBy('created_at', 'desc'));
        const pSnapshot = await getDocs(pQ);
        setPosts(pSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Post)));`
);

content = content.replace(
  /const channel = supabase\.channel\('gallery_changes'\)[\s\S]*?\}\)\.subscribe\(\);/m,
  `const unsubscribe = onSnapshot(collection(db, 'posts'), () => {
      fetchPosts();
    });`
);

content = content.replace(
  /if \(imageUrl && imageUrl\.includes\('supabase\.co'\)\) \{[\s\S]*?await supabase\.storage\.from\('images'\)\.remove\(\[fileName\]\);[\s\S]*?\}/m,
  `if (imageUrl && imageUrl.includes('firebasestorage')) {
          const fileRef = ref(storage, imageUrl);
          await deleteObject(fileRef).catch(e => console.error('Error deleting image:', e));
        }`
);

content = content.replace(
  /const \{ error \} = await supabase\.from\('posts'\)\.delete\(\)\.eq\('id', id\);[\s\S]*?if \(error\) throw error;[\s\S]*?const \{ data \} = await supabase\.from\('posts'\)\.select\('\*'\)\.order\('created_at', \{ ascending: false \}\);[\s\S]*?if \(data\) setPosts\(data\);/m,
  `await deleteDoc(doc(db, 'posts', id));
        
        const pQ = query(collection(db, 'posts'), orderBy('created_at', 'desc'));
        const pSnapshot = await getDocs(pQ);
        setPosts(pSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Post)));`
);

// 8. AdminPanel
content = content.replace(
  /const \{ error \} = await supabase\.storage\.from\('images'\)\.upload\(fileName, file\);[\s\S]*?const \{ data: \{ publicUrl \} \} = supabase\.storage\.from\('images'\)\.getPublicUrl\(fileName\);[\s\S]*?return publicUrl;/m,
  `const storageRef = ref(storage, \`images/\${fileName}\`);
    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);`
);

content = content.replace(
  /supabase\.auth\.getSession\(\)\.then\(\(\{ data: \{ session \} \}\) => \{[\s\S]*?\}\);/m,
  `const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && allowedAdmins.includes(user.email || '')) {
        setSession(user as any);
      } else {
        setSession(null);
      }
      setLoading(false);
    });`
);

content = content.replace(
  /const \{ data: \{ subscription \} \} = supabase\.auth\.onAuthStateChange\(\(_event, session\) => \{[\s\S]*?\}\);[\s\S]*?return \(\) => subscription\.unsubscribe\(\);/m,
  `return () => unsubscribe();`
);

content = content.replace(
  /await supabase\.auth\.signOut\(\);/m,
  `await signOut(auth);`
);

content = content.replace(
  /const \{ error: checkError \} = await supabase\.from\('settings'\)\.select\('key'\)\.limit\(1\);[\s\S]*?if \(checkError && checkError\.message\.includes\('does not exist'\)\) \{[\s\S]*?setDbStatus\('missing_tables'\);[\s\S]*?return;[\s\S]*?\}/m,
  ``
);

content = content.replace(
  /const \{ data: pData, error: pError \} = await supabase\.from\('posts'\)\.select\('\*'\)\.order\('created_at', \{ ascending: false \}\);[\s\S]*?if \(sData\) \{[\s\S]*?sData\.forEach\(item => \{ s\[item\.key\] = item\.value; \}\);[\s\S]*?setSettings\(prev => \(\{ \.\.\.prev, \.\.\.s \}\)\);[\s\S]*?\}/m,
  `const pQ = query(collection(db, 'posts'), orderBy('created_at', 'desc'));
        const pSnapshot = await getDocs(pQ);
        setPosts(pSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Post)));

        const rQ = query(collection(db, 'registrations'), orderBy('created_at', 'desc'));
        const rSnapshot = await getDocs(rQ);
        setRegistrations(rSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any)));

        const nQ = query(collection(db, 'notifications'), orderBy('created_at', 'desc'));
        const nSnapshot = await getDocs(nQ);
        setNotifications(nSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Notification)));

        const sQ = query(collection(db, 'settings'));
        const sSnapshot = await getDocs(sQ);
        if (!sSnapshot.empty) {
          const s: any = {};
          sSnapshot.forEach(doc => { s[doc.id] = doc.data().value; });
          setSettings(prev => ({ ...prev, ...s }));
        }`
);

content = content.replace(
  /const channel = supabase\.channel\('admin_changes'\)[\s\S]*?\}\)\.subscribe\(\);/m,
  `const unsubscribeAdmin = onSnapshot(collection(db, 'settings'), () => {
      fetchData();
    });`
);

content = content.replace(
  /const \{ data, error: selectError \} = await supabase\.from\('settings'\)\.select\('key'\)\.eq\('key', key\);[\s\S]*?const \{ error \} = await supabase\.from\('settings'\)\.insert\(\[\{ key, value \}\]\);[\s\S]*?if \(error\) throw error;[\s\S]*?\}/m,
  `await setDoc(doc(db, 'settings', key), { key, value });`
);

content = content.replace(
  /const \{ data, error \} = await supabase\.from\('notifications'\)\.insert\(\[newNotif\]\)\.select\(\);[\s\S]*?if \(error\) throw error;/m,
  `await addDoc(collection(db, 'notifications'), newNotif);`
);

content = content.replace(
  /const \{ error \} = await supabase\.from\('notifications'\)\.delete\(\)\.eq\('id', id\);[\s\S]*?if \(error\) throw error;/m,
  `await deleteDoc(doc(db, 'notifications', id));`
);

content = content.replace(
  /const \{ error \} = await supabase\.from\('notifications'\)\.delete\(\)\.neq\('id', '0'\);[\s\S]*?if \(error\) throw error;/m,
  `const q = query(collection(db, 'notifications'));
        const snapshot = await getDocs(q);
        const deletePromises = snapshot.docs.map(docSnapshot => deleteDoc(doc(db, 'notifications', docSnapshot.id)));
        await Promise.all(deletePromises);`
);

content = content.replace(
  /const \{ error \} = await supabase\.from\('posts'\)\.update\(newPost\)\.eq\('id', editingPost\.id\);[\s\S]*?if \(error\) throw error;/m,
  `await updateDoc(doc(db, 'posts', editingPost.id), postToSave);`
);

content = content.replace(
  /const \{ data, error \} = await supabase\.from\('posts'\)\.insert\(\[postToSave\]\)\.select\(\);[\s\S]*?if \(error\) throw error;/m,
  `await addDoc(collection(db, 'posts'), postToSave);`
);

content = content.replace(
  /if \(imageUrl && imageUrl\.includes\('supabase\.co'\)\) \{[\s\S]*?await supabase\.storage\.from\('images'\)\.remove\(\[fileName\]\);[\s\S]*?\}/m,
  `if (imageUrl && imageUrl.includes('firebasestorage')) {
          const fileRef = ref(storage, imageUrl);
          await deleteObject(fileRef).catch(e => console.error('Error deleting image:', e));
        }`
);

content = content.replace(
  /const \{ error \} = await supabase\.from\('posts'\)\.delete\(\)\.eq\('id', id\);[\s\S]*?if \(error\) throw error;/m,
  `await deleteDoc(doc(db, 'posts', id));`
);

content = content.replace(
  /const \{ error \} = await supabase\.from\('registrations'\)\.delete\(\)\.eq\('id', id\);[\s\S]*?if \(error\) throw error;/m,
  `await deleteDoc(doc(db, 'registrations', id));`
);

content = content.replace(
  /const supabaseUrl = import\.meta\.env\.VITE_SUPABASE_URL \|\| '';[\s\S]*?const isMissingKeys = !supabaseUrl \|\| !supabaseAnonKey;[\s\S]*?if \(isMissingKeys\) \{[\s\S]*?return;[\s\S]*?\}/m,
  ``
);

content = content.replace(
  /const \{ error \} = await supabase\.auth\.signUp\(\{[\s\S]*?\}\);[\s\S]*?if \(error\) throw error;/m,
  `await createUserWithEmailAndPassword(auth, email, password);`
);

content = content.replace(
  /const \{ error \} = await supabase\.auth\.signInWithPassword\(\{[\s\S]*?\}\);[\s\S]*?if \(error\) throw error;/m,
  `await signInWithEmailAndPassword(auth, email, password);`
);

content = content.replace(
  /const supabaseUrl = import\.meta\.env\.VITE_SUPABASE_URL \|\| '';[\s\S]*?const isMissingKeys = !supabaseUrl \|\| !supabaseAnonKey;/m,
  `const isMissingKeys = false;`
);

fs.writeFileSync('src/App.tsx', content);
