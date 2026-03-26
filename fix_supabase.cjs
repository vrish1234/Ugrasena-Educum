const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(
  /const \{ data, error \} = await supabase\.from\('notifications'\)\.select\('\*'\)\.order\('created_at', \{ ascending: false \}\);/g,
  `const q = query(collection(db, 'notifications'), orderBy('created_at', 'desc'));
        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Notification));
        const error = null;`
);

content = content.replace(
  /const \{ data: noticeData, error: nError \} = await supabase[\s\S]*?\.limit\(1\);/m,
  `const nQ = query(collection(db, 'notifications'), orderBy('created_at', 'desc'), limit(1));
        const nSnapshot = await getDocs(nQ);
        const noticeData = nSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Notification));
        const nError = null;`
);

content = content.replace(
  /const \{ data: postsData, error: pError \} = await supabase[\s\S]*?\.limit\(3\);/m,
  `const pQ = query(collection(db, 'posts'), orderBy('created_at', 'desc'), limit(3));
        const pSnapshot = await getDocs(pQ);
        const postsData = pSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Post));
        const pError = null;`
);

content = content.replace(
  /const \{ data: \{ session \} \} = await supabase\.auth\.getSession\(\);/g,
  `const session = { user: auth.currentUser };`
);

content = content.replace(
  /const \{ data, error \} = await supabase[\s\S]*?\.order\('created_at', \{ ascending: false \}\);/m,
  `const pQ = query(collection(db, 'posts'), orderBy('created_at', 'desc'));
        const pSnapshot = await getDocs(pQ);
        const data = pSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Post));
        const error = null;`
);

content = content.replace(
  /const channel = supabase\.channel\('gallery_changes'\)[\s\S]*?\}\)\.subscribe\(\);/m,
  `const unsubscribe = onSnapshot(collection(db, 'posts'), () => {
      fetchMedia();
    });`
);

content = content.replace(
  /const \{ data \} = await supabase\.from\('posts'\)\.select\('\*'\)\.order\('created_at', \{ ascending: false \}\);/g,
  `const pQ = query(collection(db, 'posts'), orderBy('created_at', 'desc'));
      const pSnapshot = await getDocs(pQ);
      const data = pSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Post));`
);

content = content.replace(
  /const \{ error: checkError \} = await supabase\.from\('settings'\)\.select\('key'\)\.limit\(1\);/g,
  `const checkError = null;`
);

content = content.replace(
  /const \{ data: pData, error: pError \} = await supabase\.from\('posts'\)\.select\('\*'\)\.order\('created_at', \{ ascending: false \}\);/g,
  `const pQ = query(collection(db, 'posts'), orderBy('created_at', 'desc'));
        const pSnapshot = await getDocs(pQ);
        const pData = pSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Post));
        const pError = null;`
);

content = content.replace(
  /const \{ data: rData \} = await supabase\.from\('registrations'\)\.select\('\*'\)\.order\('created_at', \{ ascending: false \}\);/g,
  `const rQ = query(collection(db, 'registrations'), orderBy('created_at', 'desc'));
        const rSnapshot = await getDocs(rQ);
        const rData = rSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));`
);

content = content.replace(
  /const \{ data: nData, error: nError \} = await supabase\.from\('notifications'\)\.select\('\*'\)\.order\('created_at', \{ ascending: false \}\);/g,
  `const nQ = query(collection(db, 'notifications'), orderBy('created_at', 'desc'));
        const nSnapshot = await getDocs(nQ);
        const nData = nSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Notification));
        const nError = null;`
);

content = content.replace(
  /const \{ data: sData, error: sError \} = await supabase\.from\('settings'\)\.select\('\*'\);/g,
  `const sQ = query(collection(db, 'settings'));
        const sSnapshot = await getDocs(sQ);
        const sData = sSnapshot.docs.map(doc => ({ key: doc.id, value: doc.data().value }));
        const sError = null;`
);

content = content.replace(
  /const channel = supabase\.channel\('admin_changes'\)[\s\S]*?\}\)\.subscribe\(\);/m,
  `const unsubscribeAdmin = onSnapshot(collection(db, 'settings'), () => {
      fetchData();
    });`
);

content = content.replace(
  /const \{ error \} = await supabase\.from\('posts'\)\.delete\(\)\.eq\('id', id\);/g,
  `await deleteDoc(doc(db, 'posts', id)); const error = null;`
);

fs.writeFileSync('src/App.tsx', content);
