import React, { useState, useEffect, useRef, useCallback } from "react";

// ==========================================
// PALETTE & CONSTANTS
// ==========================================
const P = {
  seafoam:"#A8D5CF",teal:"#7BC0BE",deepTeal:"#5AACAC",sage:"#A8C8A8",eucalyptus:"#90B89A",
  golden:"#E0C580",warmAmber:"#DCBA82",sunlitSand:"#F0E0C0",
  oceanBlue:"#8DC0D8",softBlue:"#B0D0DC",mistBlue:"#C0D8E4",
  blushPink:"#E8B8B0",softPeach:"#F0D0C0",
  cream:"#FBF7F0",warmWhite:"#F6F0E6",sand:"#E8DCC8",
  driftwood:"#7A6B54",deepWarm:"#5A4D3E",muted:"#A89888",softMuted:"#C0B0A0",
};

const HL=[
  {n:"Seafoam",c:"#A8D5CF",bg:"#A8D5CF33",t:"#2d4a44"},
  {n:"Golden",c:"#E0C580",bg:"#E0C58033",t:"#4a4020"},
  {n:"Blush",c:"#E8B8B0",bg:"#E8B8B033",t:"#4a3030"},
  {n:"Lavender",c:"#C4B4D8",bg:"#C4B4D833",t:"#3a3048"},
  {n:"Sky",c:"#8DC0D8",bg:"#8DC0D833",t:"#2a3a44"}
];

// ==========================================
// BIBLE STRUCTURE
// ==========================================
const BIBLE_BOOKS = [
  {name:"Genesis",chapters:50,abbr:"Gen"},{name:"Exodus",chapters:40,abbr:"Exod"},{name:"Leviticus",chapters:27,abbr:"Lev"},{name:"Numbers",chapters:36,abbr:"Num"},{name:"Deuteronomy",chapters:34,abbr:"Deut"},{name:"Joshua",chapters:24,abbr:"Josh"},{name:"Judges",chapters:21,abbr:"Judg"},{name:"Ruth",chapters:4,abbr:"Ruth"},{name:"1 Samuel",chapters:31,abbr:"1Sam"},{name:"2 Samuel",chapters:24,abbr:"2Sam"},{name:"1 Kings",chapters:22,abbr:"1Kgs"},{name:"2 Kings",chapters:25,abbr:"2Kgs"},{name:"1 Chronicles",chapters:29,abbr:"1Chr"},{name:"2 Chronicles",chapters:36,abbr:"2Chr"},{name:"Ezra",chapters:10,abbr:"Ezra"},{name:"Nehemiah",chapters:13,abbr:"Neh"},{name:"Esther",chapters:10,abbr:"Esth"},{name:"Job",chapters:42,abbr:"Job"},{name:"Psalms",chapters:150,abbr:"Ps"},{name:"Proverbs",chapters:31,abbr:"Prov"},{name:"Ecclesiastes",chapters:12,abbr:"Eccl"},{name:"Song of Solomon",chapters:8,abbr:"Song"},{name:"Isaiah",chapters:66,abbr:"Isa"},{name:"Jeremiah",chapters:52,abbr:"Jer"},{name:"Lamentations",chapters:5,abbr:"Lam"},{name:"Ezekiel",chapters:48,abbr:"Ezek"},{name:"Daniel",chapters:12,abbr:"Dan"},{name:"Hosea",chapters:14,abbr:"Hos"},{name:"Joel",chapters:3,abbr:"Joel"},{name:"Amos",chapters:9,abbr:"Amos"},{name:"Obadiah",chapters:1,abbr:"Obad"},{name:"Jonah",chapters:4,abbr:"Jonah"},{name:"Micah",chapters:7,abbr:"Mic"},{name:"Nahum",chapters:3,abbr:"Nah"},{name:"Habakkuk",chapters:3,abbr:"Hab"},{name:"Zephaniah",chapters:3,abbr:"Zeph"},{name:"Haggai",chapters:2,abbr:"Hag"},{name:"Zechariah",chapters:14,abbr:"Zech"},{name:"Malachi",chapters:4,abbr:"Mal"},
  {name:"Matthew",chapters:28,abbr:"Matt"},{name:"Mark",chapters:16,abbr:"Mark"},{name:"Luke",chapters:24,abbr:"Luke"},{name:"John",chapters:21,abbr:"John"},{name:"Acts",chapters:28,abbr:"Acts"},{name:"Romans",chapters:16,abbr:"Rom"},{name:"1 Corinthians",chapters:16,abbr:"1Cor"},{name:"2 Corinthians",chapters:13,abbr:"2Cor"},{name:"Galatians",chapters:6,abbr:"Gal"},{name:"Ephesians",chapters:6,abbr:"Eph"},{name:"Philippians",chapters:4,abbr:"Phil"},{name:"Colossians",chapters:4,abbr:"Col"},{name:"1 Thessalonians",chapters:5,abbr:"1Thess"},{name:"2 Thessalonians",chapters:3,abbr:"2Thess"},{name:"1 Timothy",chapters:6,abbr:"1Tim"},{name:"2 Timothy",chapters:4,abbr:"2Tim"},{name:"Titus",chapters:3,abbr:"Titus"},{name:"Philemon",chapters:1,abbr:"Phlm"},{name:"Hebrews",chapters:13,abbr:"Heb"},{name:"James",chapters:5,abbr:"Jas"},{name:"1 Peter",chapters:5,abbr:"1Pet"},{name:"2 Peter",chapters:3,abbr:"2Pet"},{name:"1 John",chapters:5,abbr:"1John"},{name:"2 John",chapters:1,abbr:"2John"},{name:"3 John",chapters:1,abbr:"3John"},{name:"Jude",chapters:1,abbr:"Jude"},{name:"Revelation",chapters:22,abbr:"Rev"},
];
const OT_COUNT = 39;

// External Bible links helper
function getBibleLinks(bookName, chapter, verse) {
  const bk = bookName.replace(/\s/g, "");
  const bgSearch = encodeURIComponent(`${bookName} ${chapter}${verse ? ':' + verse : ''}`);
  const lwSearch = encodeURIComponent(`${bookName} ${chapter}${verse ? ':' + verse : ''}`);
  return [
    { name: "BibleGateway", icon: "📖", url: `https://www.biblegateway.com/passage/?search=${bgSearch}&version=KJV`, color: P.blushPink, desc: "KJV, NIV, ESV & more" },
    { name: "Bible.com", icon: "🔗", url: `https://www.bible.com/bible/1/${bk.toUpperCase()}.${chapter}.KJV`, color: P.softBlue, desc: "YouVersion" },
    { name: "Blue Letter", icon: "📘", url: `https://www.blueletterbible.org/kjv/${bk.substring(0, 3).toLowerCase()}/${chapter}/${verse || 1}/`, color: P.oceanBlue, desc: "Greek & Hebrew tools" },
    { name: "Literal Word", icon: "📜", url: `https://nasb.literalword.com/?q=${lwSearch}`, color: P.sage, desc: "NASB" },
  ];
}

// ==========================================
// KJV BIBLE DATA — Dynamic loading from JSON files
// ==========================================

// Convert book name to JSON filename (must match files in /public/kjv/)
function getBookFileName(bookName) {
  return bookName.replace(/\s/g, "") + ".json";
}

// Cache for loaded book data so we don't re-fetch
const bookCache = {};

// Fetch a chapter's verses from the KJV JSON files
async function fetchChapter(bookName, chapterNum) {
  const fileName = getBookFileName(bookName);

  // Return from cache if we already loaded this book
  if (bookCache[bookName]) {
    const ch = bookCache[bookName].find(c => c.chapter === chapterNum);
    if (ch) return ch.verses.map(v => ({ v: v.verse, t: v.text }));
    return [];
  }

  // Fetch the book JSON
  try {
    const res = await fetch(`/kjv/${fileName}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    // Cache the chapters array
    bookCache[bookName] = data.chapters;
    const ch = data.chapters.find(c => c.chapter === chapterNum);
    if (ch) return ch.verses.map(v => ({ v: v.verse, t: v.text }));
    return [];
  } catch (err) {
    console.error(`Failed to load ${fileName}:`, err);
    return [];
  }
}

// Hook to load chapter data with loading state
function useChapter(bookName, chapterNum) {
  const [verses, setVerses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);
    fetchChapter(bookName, chapterNum).then(data => {
      if (!cancelled) {
        setVerses(data);
        setLoading(false);
        if (data.length === 0) setError(true);
      }
    });
    return () => { cancelled = true; };
  }, [bookName, chapterNum]);

  return { verses, loading, error };
}

// ==========================================
// CSS
// ==========================================
const CSS=`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=Quicksand:wght@300;400;500;600&family=Dancing+Script:wght@400;500&display=swap');
*{box-sizing:border-box;margin:0;padding:0}
@keyframes blobFloat{0%{transform:translate(0,0) scale(1)}100%{transform:translate(20px,-15px) scale(1.1)}}
@keyframes fadeUp{0%{opacity:0;transform:translateY(30px)}100%{opacity:1;transform:translateY(0)}}
@keyframes slideUp{0%{opacity:0;transform:translateY(100%)}100%{opacity:1;transform:translateY(0)}}
@keyframes noteIn{0%{opacity:0;transform:scale(.95)}100%{opacity:1;transform:scale(1)}}
@keyframes sunGlow{0%,100%{opacity:.06}50%{opacity:.12}}
@keyframes toastIn{0%{opacity:0;transform:translateY(20px) scale(.95)}100%{opacity:1;transform:translateY(0) scale(1)}}
@keyframes chapterFade{0%{opacity:0;transform:translateY(12px)}100%{opacity:1;transform:translateY(0)}}
.chapter-text{animation:chapterFade .4s ease-out}
@keyframes rippleOut{0%{transform:scale(0);opacity:.4}100%{transform:scale(4);opacity:0}}
::-webkit-scrollbar{width:6px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:${P.sand};border-radius:3px}`;

// ==========================================
// SHARED COMPONENTS
// ==========================================
function Blob({color,opacity=.15,size,top,left,delay=0}){return<div style={{position:"absolute",top,left,width:size,height:size,opacity,borderRadius:"50%",background:`radial-gradient(ellipse at 30% 40%,${color},transparent 70%)`,filter:"blur(40px)",animation:`blobFloat ${8+delay}s ease-in-out infinite alternate`,animationDelay:`${delay}s`,pointerEvents:"none"}}/>}
function Logo({size=80,light=false}){const c=light?P.cream:P.driftwood,w=light?P.seafoam:P.teal,ci=light?"rgba(255,255,255,.25)":P.sand;return<svg width={size} height={size} viewBox="0 0 80 80"><circle cx="40" cy="40" r="36" stroke={ci} strokeWidth="1.5" fill="none"/><line x1="40" y1="18" x2="40" y2="48" stroke={c} strokeWidth="2" strokeLinecap="round"/><line x1="30" y1="28" x2="50" y2="28" stroke={c} strokeWidth="2" strokeLinecap="round"/><path d="M18,56 C26,52 32,60 40,56 C48,52 54,60 62,56" stroke={w} strokeWidth="1.8" fill="none" strokeLinecap="round"/></svg>}
function LogoSm({size=22}){return<svg width={size} height={size} viewBox="0 0 80 80"><circle cx="40" cy="40" r="36" stroke={P.seafoam} strokeWidth="2" fill="none"/><line x1="40" y1="18" x2="40" y2="48" stroke={P.driftwood} strokeWidth="2.5" strokeLinecap="round"/><line x1="30" y1="28" x2="50" y2="28" stroke={P.driftwood} strokeWidth="2.5" strokeLinecap="round"/><path d="M18,56 C26,52 32,60 40,56 C48,52 54,60 62,56" stroke={P.teal} strokeWidth="2.2" fill="none" strokeLinecap="round"/></svg>}
function Toast({message,visible,icon}){if(!visible)return null;return<div style={{position:"fixed",bottom:80,left:"50%",transform:"translateX(-50%)",background:"rgba(61,75,62,.92)",color:P.cream,padding:"12px 24px",borderRadius:30,fontFamily:"'Quicksand',sans-serif",fontSize:13,backdropFilter:"blur(10px)",boxShadow:"0 4px 20px rgba(0,0,0,.15)",zIndex:1000,display:"flex",alignItems:"center",gap:8,animation:"toastIn .3s ease-out",whiteSpace:"nowrap"}}>{icon&&<span>{icon}</span>}{message}</div>}

// Bottom sheet modal
function BottomSheet({ visible, onClose, title, children }) {
  if (!visible) return null;
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.4)",backdropFilter:"blur(8px)",zIndex:100,display:"flex",alignItems:"flex-end",justifyContent:"center"}} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{background:P.cream,borderRadius:"24px 24px 0 0",padding:"24px 20px 32px",width:"100%",maxWidth:480,maxHeight:"70vh",overflowY:"auto",animation:"slideUp .3s ease-out"}}>
        <div style={{width:36,height:4,borderRadius:2,background:P.sand,margin:"0 auto 14px"}}/>
        <h3 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:20,fontWeight:400,color:P.driftwood,textAlign:"center",marginBottom:16}}>{title}</h3>
        {children}
      </div>
    </div>
  );
}

// ==========================================
// SAVED ITEMS PANEL (Likes, Highlights, Notes, Bookmarks)
// ==========================================
function SavedPanel({ visible, onClose, favorites, bookmarks, highlights, notes, onNavigate }) {
  const [tab, setTab] = useState("favorites");

  const tabs = [
    { k: "favorites", l: "💕 Liked", count: favorites.length },
    { k: "bookmarks", l: "🔖 Saved", count: bookmarks.length },
    { k: "highlights", l: "🎨 Highlighted", count: Object.keys(highlights).length },
    { k: "notes", l: "📝 Notes", count: Object.keys(notes).length },
  ];

  const parseKey = k => { const p = k.split("-"); const v = p.pop(); const ch = p.pop(); const book = p.join(" "); return { book, ch, v, display: `${book} ${ch}:${v}` }; };

  if (!visible) return null;
  return (
    <BottomSheet visible={visible} onClose={onClose} title="✦ My Collection">
      {/* Future account hint */}
      <div style={{background:`${P.seafoam}12`,borderRadius:12,padding:"10px 14px",marginBottom:16,border:`1px solid ${P.seafoam}22`,textAlign:"center"}}>
        <p style={{fontFamily:"'Quicksand',sans-serif",fontSize:11,color:P.deepTeal}}>Create an account to save across devices</p>
        <button style={{marginTop:6,padding:"6px 18px",borderRadius:16,background:`linear-gradient(135deg,${P.teal},${P.deepTeal})`,color:P.cream,border:"none",cursor:"pointer",fontFamily:"'Quicksand',sans-serif",fontSize:10,letterSpacing:".08em",opacity:.7}}>Coming Soon</button>
      </div>

      {/* Tabs */}
      <div style={{display:"flex",gap:4,marginBottom:14,overflowX:"auto",paddingBottom:4}}>
        {tabs.map(t=>(
          <button key={t.k} onClick={()=>setTab(t.k)} style={{padding:"6px 12px",borderRadius:16,border:"none",cursor:"pointer",fontFamily:"'Quicksand',sans-serif",fontSize:11,whiteSpace:"nowrap",background:tab===t.k?`${P.teal}22`:`${P.sand}33`,color:tab===t.k?P.deepTeal:P.muted,fontWeight:tab===t.k?600:400,transition:"all .2s"}}>
            {t.l} <span style={{fontSize:9,opacity:.7}}>({t.count})</span>
          </button>
        ))}
      </div>

      {/* Favorites */}
      {tab === "favorites" && (favorites.length === 0 ? (
        <p style={{textAlign:"center",fontFamily:"'Quicksand',sans-serif",fontSize:12,color:P.softMuted,padding:"20px 0"}}>Tap the heart on any verse to save it here</p>
      ) : (
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {favorites.map(f=>(
            <div key={f.ref} onClick={()=>{onNavigate(f.book,f.chapter,f.sv);onClose()}} style={{background:"white",borderRadius:12,padding:14,borderLeft:`3px solid ${P.blushPink}`,cursor:"pointer",transition:"all .2s"}}>
              <p style={{fontFamily:"'Quicksand',sans-serif",fontSize:10,color:P.teal,fontWeight:600,marginBottom:4}}>{f.ref}</p>
              <p style={{fontFamily:"'Cormorant Garamond',serif",fontSize:14,color:P.deepWarm,fontStyle:"italic",lineHeight:1.6}}>{f.text.substring(0,120)}{f.text.length>120?"...":""}</p>
            </div>
          ))}
        </div>
      ))}

      {/* Bookmarks */}
      {tab === "bookmarks" && (bookmarks.length === 0 ? (
        <p style={{textAlign:"center",fontFamily:"'Quicksand',sans-serif",fontSize:12,color:P.softMuted,padding:"20px 0"}}>Tap any verse in the Bible reader to bookmark it</p>
      ) : (
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {bookmarks.map(b=>{
            const p = parseKey(b.key);
            return (
              <div key={b.key} onClick={()=>{onNavigate(p.book,parseInt(p.ch),parseInt(p.v));onClose()}} style={{background:"white",borderRadius:12,padding:14,borderLeft:`3px solid ${P.golden}`,cursor:"pointer"}}>
                <p style={{fontFamily:"'Quicksand',sans-serif",fontSize:10,color:P.teal,fontWeight:600,marginBottom:4}}>{b.ref}</p>
                <p style={{fontFamily:"'Cormorant Garamond',serif",fontSize:13,color:P.deepWarm,fontStyle:"italic"}}>{b.text}</p>
              </div>
            );
          })}
        </div>
      ))}

      {/* Highlights */}
      {tab === "highlights" && (Object.keys(highlights).length === 0 ? (
        <p style={{textAlign:"center",fontFamily:"'Quicksand',sans-serif",fontSize:12,color:P.softMuted,padding:"20px 0"}}>Highlight verses with any of 5 colors in the Bible reader</p>
      ) : (
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {Object.entries(highlights).map(([k,hi])=>{
            const p = parseKey(k);
            const hlC = HL[hi];
            return (
              <div key={k} onClick={()=>{onNavigate(p.book,parseInt(p.ch),parseInt(p.v));onClose()}} style={{background:hlC?.bg||"white",borderRadius:12,padding:14,borderLeft:`3px solid ${hlC?.c||P.sand}`,cursor:"pointer"}}>
                <p style={{fontFamily:"'Quicksand',sans-serif",fontSize:10,color:hlC?.c||P.teal,fontWeight:600}}>{p.display}</p>
              </div>
            );
          })}
        </div>
      ))}

      {/* Notes */}
      {tab === "notes" && (Object.keys(notes).length === 0 ? (
        <p style={{textAlign:"center",fontFamily:"'Quicksand',sans-serif",fontSize:12,color:P.softMuted,padding:"20px 0"}}>Add personal notes to any verse in the Bible reader</p>
      ) : (
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {Object.entries(notes).map(([k,note])=>{
            const p = parseKey(k);
            return (
              <div key={k} onClick={()=>{onNavigate(p.book,parseInt(p.ch),parseInt(p.v));onClose()}} style={{background:"white",borderRadius:12,padding:14,borderLeft:`3px solid ${P.seafoam}`,cursor:"pointer"}}>
                <p style={{fontFamily:"'Quicksand',sans-serif",fontSize:10,color:P.teal,fontWeight:600,marginBottom:4}}>{p.display}</p>
                <p style={{fontFamily:"'Quicksand',sans-serif",fontSize:12,color:P.deepWarm,fontStyle:"italic"}}>{note}</p>
              </div>
            );
          })}
        </div>
      ))}
    </BottomSheet>
  );
}

// ==========================================
// FULL BIBLE READER
// ==========================================
function FullBibleReader({ onBack, initialBook, initialChapter, initialVerse, highlights, setHighlights, notes, setNotes, bookmarks, setBookmarks }) {
  const [book, setBook] = useState(initialBook || "Genesis");
  const [chapter, setChapter] = useState(initialChapter || 1);
  const [scrollVerse, setScrollVerse] = useState(initialVerse || null);
  const [showBookPicker, setShowBookPicker] = useState(false);
  const [showChapterPicker, setShowChapterPicker] = useState(false);
  const [activeVerse, setActiveVerse] = useState(null);
  const [editNote, setEditNote] = useState(null);
  const [noteInput, setNoteInput] = useState("");
  const [toast, setToast] = useState({visible:false,message:"",icon:""});
  const [animKey, setAnimKey] = useState(0);
  const contentRef = useRef(null);
  const verseRefs = useRef({});

  const stf=(m,i="✦")=>{setToast({visible:true,message:m,icon:i});setTimeout(()=>setToast({visible:false,message:"",icon:""}),2500)};

  const currentBookData = BIBLE_BOOKS.find(b=>b.name===book);
  const maxChapter = currentBookData ? currentBookData.chapters : 1;
  const { verses, loading, error } = useChapter(book, chapter);
  const links = getBibleLinks(book, chapter);

  const goToChapter = useCallback((newBook, newChapter, verse=null) => {
    setBook(newBook); setChapter(newChapter); setScrollVerse(verse);
    setActiveVerse(null); setEditNote(null);
    setShowBookPicker(false); setShowChapterPicker(false);
    setAnimKey(k=>k+1);
    if(contentRef.current) contentRef.current.scrollTop=0;
  }, []);

  const goPrev=()=>{if(chapter>1)goToChapter(book,chapter-1);else{const idx=BIBLE_BOOKS.findIndex(b=>b.name===book);if(idx>0){const pb=BIBLE_BOOKS[idx-1];goToChapter(pb.name,pb.chapters)}}};
  const goNext=()=>{if(chapter<maxChapter)goToChapter(book,chapter+1);else{const idx=BIBLE_BOOKS.findIndex(b=>b.name===book);if(idx<BIBLE_BOOKS.length-1)goToChapter(BIBLE_BOOKS[idx+1].name,1)}};

  useEffect(()=>{if(scrollVerse&&verseRefs.current[scrollVerse])setTimeout(()=>verseRefs.current[scrollVerse]?.scrollIntoView({behavior:"smooth",block:"center"}),350)},[scrollVerse,animKey]);

  const mk=v=>`${book}-${chapter}-${v}`;
  const doHl=(v,i)=>{const k=mk(v);if(i===null){const n={...highlights};delete n[k];setHighlights(n)}else setHighlights({...highlights,[k]:i});stf(i===null?"Removed":"Highlighted!","🎨")};
  const doNote=v=>{if(!noteInput.trim())return;setNotes({...notes,[mk(v)]:noteInput.trim()});setNoteInput("");setEditNote(null);stf("Note saved","📝")};
  const delNote=v=>{const n={...notes};delete n[mk(v)];setNotes(n);setEditNote(null);stf("Deleted","🗑️")};
  const doBm=(v,t)=>{const k=mk(v);if(bookmarks.some(b=>b.key===k)){setBookmarks(bookmarks.filter(b=>b.key!==k));stf("Removed","🔖")}else{setBookmarks([...bookmarks,{key:k,ref:`${book} ${chapter}:${v}`,text:t.substring(0,80)+(t.length>80?"...":"")}]);stf("Bookmarked!","🔖")}};

  const isFirst = book===BIBLE_BOOKS[0].name && chapter===1;
  const isLast = book===BIBLE_BOOKS[BIBLE_BOOKS.length-1].name && chapter===maxChapter;
  const getPrevLabel=()=>{if(chapter>1)return `${book} ${chapter-1}`;const idx=BIBLE_BOOKS.findIndex(b=>b.name===book);if(idx>0){const pb=BIBLE_BOOKS[idx-1];return `${pb.name} ${pb.chapters}`}return ""};
  const getNextLabel=()=>{if(chapter<maxChapter)return `${book} ${chapter+1}`;const idx=BIBLE_BOOKS.findIndex(b=>b.name===book);if(idx<BIBLE_BOOKS.length-1)return `${BIBLE_BOOKS[idx+1].name} 1`;return ""};

  return (
    <div style={{minHeight:"100vh",background:P.cream,fontFamily:"'Cormorant Garamond',Georgia,serif",display:"flex",flexDirection:"column"}}>
      <style>{CSS}</style>

      {/* HEADER */}
      <div style={{position:"sticky",top:0,zIndex:30,background:`${P.cream}f0`,backdropFilter:"blur(16px)",borderBottom:`1px solid ${P.sand}55`}}>
        <div style={{display:"flex",alignItems:"center",gap:8,padding:"10px 16px",maxWidth:720,margin:"0 auto"}}>
          <button onClick={onBack} style={{background:`${P.seafoam}22`,border:"none",borderRadius:"50%",width:36,height:36,cursor:"pointer",fontSize:16,color:P.driftwood,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>←</button>
          <button onClick={()=>{setShowBookPicker(!showBookPicker);setShowChapterPicker(false)}} style={{background:showBookPicker?`${P.teal}20`:`${P.sand}33`,border:`1px solid ${showBookPicker?P.teal+'44':'transparent'}`,borderRadius:20,padding:"7px 14px",cursor:"pointer",fontFamily:"'Cormorant Garamond',serif",fontSize:16,fontWeight:500,color:P.driftwood,display:"flex",alignItems:"center",gap:6}}>
            {book} <span style={{fontSize:10,color:P.muted}}>▾</span>
          </button>
          <button onClick={()=>{setShowChapterPicker(!showChapterPicker);setShowBookPicker(false)}} style={{background:showChapterPicker?`${P.teal}20`:`${P.sand}33`,border:`1px solid ${showChapterPicker?P.teal+'44':'transparent'}`,borderRadius:20,padding:"7px 14px",cursor:"pointer",fontFamily:"'Quicksand',sans-serif",fontSize:13,fontWeight:500,color:P.driftwood,display:"flex",alignItems:"center",gap:4}}>
            Ch. {chapter} <span style={{fontSize:10,color:P.muted}}>▾</span>
          </button>
          <div style={{flex:1}}/>
          <span style={{fontFamily:"'Quicksand',sans-serif",fontSize:10,color:P.teal,fontWeight:600,background:`${P.teal}15`,padding:"3px 10px",borderRadius:10}}>KJV</span>
        </div>

        {/* Bible version links */}
        <div style={{maxWidth:720,margin:"0 auto",padding:"0 16px 8px",display:"flex",gap:5,flexWrap:"wrap"}}>
          {links.map(l=>(
            <a key={l.name} href={l.url} target="_blank" rel="noopener noreferrer" style={{display:"flex",alignItems:"center",gap:4,padding:"4px 10px",borderRadius:14,background:`${l.color}15`,border:`1px solid ${l.color}25`,textDecoration:"none",fontFamily:"'Quicksand',sans-serif",fontSize:9,color:P.driftwood}}>{l.icon} {l.name} <span style={{color:P.softMuted,fontSize:8}}>· {l.desc}</span></a>
          ))}
        </div>

        {/* Book Picker */}
        {showBookPicker && (
          <div style={{position:"absolute",top:"100%",left:0,right:0,background:P.cream,borderBottom:`2px solid ${P.sand}`,maxHeight:"70vh",overflowY:"auto",zIndex:50,animation:"noteIn .2s ease-out"}}>
            <div style={{maxWidth:720,margin:"0 auto",padding:16}}>
              <p style={{fontFamily:"'Quicksand',sans-serif",fontSize:11,fontWeight:600,letterSpacing:".15em",textTransform:"uppercase",color:P.teal,marginBottom:10,paddingBottom:6,borderBottom:`1px solid ${P.seafoam}33`}}>Old Testament</p>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(120px,1fr))",gap:4,marginBottom:16}}>
                {BIBLE_BOOKS.slice(0,OT_COUNT).map(b=>(
                  <button key={b.name} onClick={()=>goToChapter(b.name,1)} style={{padding:"8px 10px",borderRadius:10,border:"none",cursor:"pointer",fontFamily:"'Quicksand',sans-serif",fontSize:12,color:b.name===book?P.cream:P.driftwood,background:b.name===book?`linear-gradient(135deg,${P.teal},${P.deepTeal})`:`${P.sand}33`,textAlign:"left"}}>{b.name}</button>
                ))}
              </div>
              <p style={{fontFamily:"'Quicksand',sans-serif",fontSize:11,fontWeight:600,letterSpacing:".15em",textTransform:"uppercase",color:P.teal,marginBottom:10,paddingBottom:6,borderBottom:`1px solid ${P.seafoam}33`}}>New Testament</p>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(120px,1fr))",gap:4}}>
                {BIBLE_BOOKS.slice(OT_COUNT).map(b=>(
                  <button key={b.name} onClick={()=>goToChapter(b.name,1)} style={{padding:"8px 10px",borderRadius:10,border:"none",cursor:"pointer",fontFamily:"'Quicksand',sans-serif",fontSize:12,color:b.name===book?P.cream:P.driftwood,background:b.name===book?`linear-gradient(135deg,${P.teal},${P.deepTeal})`:`${P.sand}33`,textAlign:"left"}}>{b.name}</button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Chapter Picker */}
        {showChapterPicker && (
          <div style={{position:"absolute",top:"100%",left:0,right:0,background:P.cream,borderBottom:`2px solid ${P.sand}`,maxHeight:"60vh",overflowY:"auto",zIndex:50,animation:"noteIn .2s ease-out"}}>
            <div style={{maxWidth:720,margin:"0 auto",padding:16}}>
              <p style={{fontFamily:"'Quicksand',sans-serif",fontSize:11,fontWeight:600,color:P.muted,marginBottom:10}}>{book} — {maxChapter} chapter{maxChapter>1?"s":""}</p>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(44px,1fr))",gap:4}}>
                {Array.from({length:maxChapter},(_,i)=>i+1).map(ch=>(
                  <button key={ch} onClick={()=>goToChapter(book,ch)} style={{padding:"10px 4px",borderRadius:10,border:"none",cursor:"pointer",fontFamily:"'Quicksand',sans-serif",fontSize:13,fontWeight:ch===chapter?600:400,color:ch===chapter?P.cream:P.driftwood,background:ch===chapter?`linear-gradient(135deg,${P.teal},${P.deepTeal})`:`${P.sand}33`}}>{ch}</button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* CONTENT */}
      <div ref={contentRef} style={{flex:1,overflowY:"auto"}}>
        <div key={animKey} className="chapter-text" style={{maxWidth:720,margin:"0 auto",padding:"24px 20px 100px"}}>
          <div style={{textAlign:"center",marginBottom:28}}>
            <p style={{fontFamily:"'Quicksand',sans-serif",fontSize:10,letterSpacing:".25em",textTransform:"uppercase",color:P.teal,marginBottom:4}}>Chapter {chapter}</p>
            <h1 style={{fontSize:28,fontWeight:300,color:P.driftwood,lineHeight:1.2}}>{book}</h1>
            <div style={{width:40,height:1,background:`linear-gradient(90deg,transparent,${P.seafoam},transparent)`,margin:"10px auto"}}/>
          </div>

          {loading ? (
            <div style={{textAlign:"center",padding:"60px 20px"}}>
              <div style={{width:48,height:48,borderRadius:"50%",border:`3px solid ${P.sand}`,borderTopColor:P.teal,margin:"0 auto 20px",animation:"spin 1s linear infinite"}}/>
              <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
              <p style={{fontFamily:"'Quicksand',sans-serif",fontSize:13,color:P.muted}}>Loading {book} {chapter}...</p>
            </div>
          ) : verses.length > 0 ? verses.map(cv => {
            const hl=highlights[mk(cv.v)];const note=notes[mk(cv.v)];const bm=bookmarks.some(b=>b.key===mk(cv.v));const hlC=hl!==undefined?HL[hl]:null;const act=activeVerse===cv.v;const isTarget=scrollVerse===cv.v;
            return (
              <div key={cv.v} ref={el=>verseRefs.current[cv.v]=el} style={{marginBottom:2}}>
                <div onClick={()=>setActiveVerse(act?null:cv.v)} style={{padding:"6px 14px",margin:"0 -14px",borderRadius:8,background:hlC?hlC.bg:isTarget?`${P.seafoam}18`:act?`${P.sand}33`:"transparent",borderLeft:isTarget?`3px solid ${P.teal}`:hlC?`3px solid ${hlC.c}`:bm?`3px solid ${P.golden}`:"3px solid transparent",cursor:"pointer",transition:"all .2s"}}>
                  <span style={{fontFamily:"'Quicksand',sans-serif",fontSize:9,fontWeight:600,color:isTarget?P.teal:hlC?hlC.c:P.softMuted,marginRight:5,verticalAlign:"super"}}>{cv.v}</span>
                  <span style={{fontSize:15.5,lineHeight:1.85,color:hlC?hlC.t:P.deepWarm,fontWeight:isTarget?400:300,fontStyle:isTarget?"italic":"normal"}}>{cv.t}</span>
                  {note&&<span style={{fontSize:9,marginLeft:3,verticalAlign:"super"}}>📝</span>}
                  {bm&&<span style={{fontSize:9,marginLeft:3,verticalAlign:"super"}}>🔖</span>}
                </div>
                {act&&(
                  <div style={{padding:"6px 14px 10px",animation:"noteIn .2s ease-out"}}>
                    <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:note||editNote===cv.v?6:0}}>
                      {HL.map((h,i)=>(<button key={i} onClick={e=>{e.stopPropagation();doHl(cv.v,hl===i?null:i)}} style={{width:24,height:24,borderRadius:"50%",background:h.c,border:hl===i?`2px solid ${P.driftwood}`:"2px solid transparent",cursor:"pointer",boxShadow:hl===i?`0 0 0 2px white,0 0 0 4px ${h.c}`:"none"}}/>))}
                      <div style={{width:1,height:24,background:P.sand,margin:"0 2px"}}/>
                      <button onClick={e=>{e.stopPropagation();doBm(cv.v,cv.t)}} style={{background:bm?`${P.golden}28`:`${P.sand}55`,border:"none",borderRadius:8,padding:"3px 9px",cursor:"pointer",fontSize:10,fontFamily:"'Quicksand',sans-serif",color:P.driftwood}}>{bm?"🔖 Saved":"🔖 Save"}</button>
                      <button onClick={e=>{e.stopPropagation();setEditNote(editNote===cv.v?null:cv.v);setNoteInput(note||"")}} style={{background:note?`${P.seafoam}28`:`${P.sand}55`,border:"none",borderRadius:8,padding:"3px 9px",cursor:"pointer",fontSize:10,fontFamily:"'Quicksand',sans-serif",color:P.driftwood}}>{note?"📝 Edit":"📝 Note"}</button>
                    </div>
                    {editNote===cv.v&&(<div style={{animation:"noteIn .2s ease-out"}}><textarea value={noteInput} onChange={e=>setNoteInput(e.target.value)} placeholder="Your thoughts..." onClick={e=>e.stopPropagation()} style={{width:"100%",minHeight:60,padding:10,borderRadius:10,border:`1px solid ${P.seafoam}44`,background:"white",fontFamily:"'Quicksand',sans-serif",fontSize:12,color:P.deepWarm,outline:"none",resize:"vertical",lineHeight:1.5}}/><div style={{display:"flex",gap:5,marginTop:5}}><button onClick={e=>{e.stopPropagation();doNote(cv.v)}} style={{padding:"6px 16px",borderRadius:16,background:`linear-gradient(135deg,${P.teal},${P.deepTeal})`,color:P.cream,border:"none",cursor:"pointer",fontFamily:"'Quicksand',sans-serif",fontSize:10}}>Save</button>{note&&<button onClick={e=>{e.stopPropagation();delNote(cv.v)}} style={{padding:"6px 12px",borderRadius:16,background:`${P.blushPink}22`,color:P.driftwood,border:"none",cursor:"pointer",fontFamily:"'Quicksand',sans-serif",fontSize:10}}>Delete</button>}<button onClick={e=>{e.stopPropagation();setEditNote(null)}} style={{padding:"6px 12px",borderRadius:16,background:P.sand,color:P.driftwood,border:"none",cursor:"pointer",fontFamily:"'Quicksand',sans-serif",fontSize:10}}>Cancel</button></div></div>)}
                    {note&&editNote!==cv.v&&(<div style={{background:`${P.seafoam}10`,borderRadius:8,padding:"6px 10px",border:`1px solid ${P.seafoam}18`}}><p style={{fontFamily:"'Quicksand',sans-serif",fontSize:11,color:P.deepWarm,fontStyle:"italic"}}>{note}</p></div>)}
                  </div>
                )}
              </div>
            );
          }) : (
            <div style={{textAlign:"center",padding:"60px 20px"}}>
              <div style={{width:60,height:60,borderRadius:"50%",background:`${P.seafoam}15`,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px",fontSize:24}}>📖</div>
              <p style={{fontFamily:"'Cormorant Garamond',serif",fontSize:20,color:P.driftwood,marginBottom:8}}>{book} {chapter}</p>
              <p style={{fontFamily:"'Quicksand',sans-serif",fontSize:13,color:P.muted,lineHeight:1.6,maxWidth:340,margin:"0 auto 20px"}}>This chapter couldn't be loaded right now. Read it in another translation:</p>
              <div style={{display:"flex",gap:8,justifyContent:"center",flexWrap:"wrap"}}>
                {links.map(l=>(<a key={l.name} href={l.url} target="_blank" rel="noopener noreferrer" style={{padding:"10px 18px",borderRadius:20,background:`${l.color}22`,color:P.deepTeal,textDecoration:"none",fontFamily:"'Quicksand',sans-serif",fontSize:11,border:`1px solid ${l.color}33`}}>{l.icon} {l.name}</a>))}
              </div>
            </div>
          )}

          {/* Read in other translations */}
          {verses.length>0&&(
            <div style={{textAlign:"center",marginTop:30,paddingTop:18,borderTop:`1px solid ${P.sand}33`}}>
              <p style={{fontFamily:"'Quicksand',sans-serif",fontSize:11,color:P.softMuted,marginBottom:10}}>Read in other translations</p>
              <div style={{display:"flex",gap:6,justifyContent:"center",flexWrap:"wrap"}}>
                {links.map(l=>(<a key={l.name} href={l.url} target="_blank" rel="noopener noreferrer" style={{padding:"8px 16px",borderRadius:20,background:`${l.color}22`,color:P.deepTeal,textDecoration:"none",fontFamily:"'Quicksand',sans-serif",fontSize:10,border:`1px solid ${l.color}33`}}>{l.icon} {l.name}</a>))}
              </div>
            </div>
          )}

          {/* Chapter navigation */}
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:30,paddingTop:24,borderTop:`1px solid ${P.sand}44`}}>
            {!isFirst?(<button onClick={goPrev} style={{background:`${P.sand}44`,border:"none",borderRadius:20,padding:"10px 18px",cursor:"pointer",fontFamily:"'Quicksand',sans-serif",fontSize:12,color:P.driftwood,display:"flex",alignItems:"center",gap:6}}><span>←</span><span style={{maxWidth:120,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{getPrevLabel()}</span></button>):<div/>}
            {!isLast?(<button onClick={goNext} style={{background:`linear-gradient(135deg,${P.teal}22,${P.deepTeal}22)`,border:`1px solid ${P.teal}33`,borderRadius:20,padding:"10px 18px",cursor:"pointer",fontFamily:"'Quicksand',sans-serif",fontSize:12,color:P.deepTeal,display:"flex",alignItems:"center",gap:6}}><span style={{maxWidth:120,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{getNextLabel()}</span><span>→</span></button>):<div/>}
          </div>
        </div>
      </div>

      <Toast message={toast.message} visible={toast.visible} icon={toast.icon}/>
    </div>
  );
}

// ==========================================
// TAP EXPERIENCE
// ==========================================
const VERSES=[
  {ref:"Psalm 23:1-3",text:"The Lord is my shepherd; I shall not want. He makes me lie down in green pastures. He leads me beside still waters. He restores my soul.",book:"Psalms",chapter:23,sv:1,ev:3},
  {ref:"Psalm 91:1-2",text:"He who dwells in the secret place of the Most High shall abide under the shadow of the Almighty. I will say of the Lord, He is my refuge and my fortress.",book:"Psalms",chapter:91,sv:1,ev:2},
  {ref:"Isaiah 41:10",text:"Fear not, for I am with you; be not dismayed, for I am your God; I will strengthen you, I will help you.",book:"Isaiah",chapter:41,sv:10,ev:10},
  {ref:"John 3:16",text:"For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.",book:"John",chapter:3,sv:16,ev:16},
  {ref:"Romans 8:28",text:"And we know that for those who love God all things work together for good, for those who are called according to his purpose.",book:"Romans",chapter:8,sv:28,ev:28},
  {ref:"Philippians 4:13",text:"I can do all things through Christ which strengtheneth me.",book:"Philippians",chapter:4,sv:13,ev:13},
  {ref:"Jeremiah 29:11",text:"For I know the plans I have for you, declares the Lord, plans for welfare and not for evil, to give you a future and a hope.",book:"Jeremiah",chapter:29,sv:11,ev:11},
  {ref:"Proverbs 3:5-6",text:"Trust in the Lord with all your heart, and do not lean on your own understanding. In all your ways acknowledge him, and he will make straight your paths.",book:"Proverbs",chapter:3,sv:5,ev:6},
  {ref:"Genesis 1:1",text:"In the beginning God created the heaven and the earth.",book:"Genesis",chapter:1,sv:1,ev:1},
  {ref:"John 1:1",text:"In the beginning was the Word, and the Word was with God, and the Word was God.",book:"John",chapter:1,sv:1,ev:1},
  {ref:"Revelation 22:21",text:"The grace of our Lord Jesus Christ be with you all. Amen.",book:"Revelation",chapter:22,sv:21,ev:21},
];

function getDV(){const n=new Date(),s=new Date(n.getFullYear(),0,0);return VERSES[Math.floor((n-s)/864e5)%VERSES.length]}
function getRV(ex){let v;do{v=VERSES[Math.floor(Math.random()*VERSES.length)]}while(v.ref===ex?.ref&&VERSES.length>1);return v}

function TapExp({onBack,onReadMore,favorites,setFavorites}){
  const [mode,setMode]=useState("daily");
  const [verse,setVerse]=useState(getDV());
  const [ak,setAk]=useState(0);
  const [rip,setRip]=useState(false);
  const [toast,setToast]=useState({visible:false,message:"",icon:""});

  const stf=(m,i="✦")=>{setToast({visible:true,message:m,icon:i});setTimeout(()=>setToast({visible:false,message:"",icon:""}),2500)};
  const isFav=favorites.some(f=>f.ref===verse.ref);
  const tFav=()=>{if(isFav){setFavorites(favorites.filter(f=>f.ref!==verse.ref));stf("Removed","🤍")}else{setFavorites([...favorites,verse]);stf("Saved!","💕")}};
  const nV=()=>{if(mode==="random"){setRip(true);setTimeout(()=>{setVerse(getRV(verse));setAk(k=>k+1);setRip(false)},300)}};
  const sw=m=>{setMode(m);setVerse(m==="daily"?getDV():getRV(verse));setAk(k=>k+1)};

  const links = getBibleLinks(verse.book, verse.chapter, verse.sv);

  return(
    <div style={{minHeight:"100vh",background:`linear-gradient(170deg,${P.cream} 0%,${P.sunlitSand}33 18%,${P.softPeach}12 30%,${P.seafoam}24 48%,${P.softBlue}24 65%,${P.teal}16 82%,${P.sage}12 100%)`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",position:"relative",overflow:"hidden",fontFamily:"'Cormorant Garamond',Georgia,serif"}}>
      <style>{CSS}</style>
      <Blob color={P.seafoam} opacity={.12} size="320px" top="-60px" left="-80px" delay={0}/>
      <Blob color={P.golden} opacity={.08} size="250px" top="55%" left="72%" delay={2}/>
      <Blob color={P.blushPink} opacity={.05} size="200px" top="12%" left="80%" delay={1}/>

      {/* Top bar */}
      <div style={{position:"fixed",top:0,left:0,right:0,display:"flex",justifyContent:"space-between",alignItems:"center",padding:"16px 20px",zIndex:10}}>
        <button onClick={onBack} style={{background:"rgba(255,255,255,.6)",border:"none",borderRadius:"50%",width:36,height:36,cursor:"pointer",fontSize:16,color:P.driftwood,backdropFilter:"blur(10px)"}}>←</button>
        <div style={{display:"flex",alignItems:"center",gap:6}}>
          <LogoSm size={18}/>
          <span style={{fontFamily:"'Quicksand',sans-serif",fontSize:11,color:P.driftwood,letterSpacing:".1em"}}>SALT & SCRIPTURE</span>
        </div>
        <div style={{width:36}}/>
      </div>

      {/* Mode toggle */}
      <div style={{position:"fixed",top:60,left:"50%",transform:"translateX(-50%)",display:"flex",background:"rgba(255,255,255,.5)",borderRadius:20,padding:3,backdropFilter:"blur(10px)",zIndex:10}}>
        {[{k:"daily",l:"☀️ Daily"},{k:"random",l:"✦ Random"}].map(m=>(
          <button key={m.k} onClick={()=>sw(m.k)} style={{padding:"6px 16px",borderRadius:18,border:"none",cursor:"pointer",fontFamily:"'Quicksand',sans-serif",fontSize:11,background:mode===m.k?"white":"transparent",color:mode===m.k?P.deepTeal:P.muted,boxShadow:mode===m.k?"0 1px 4px rgba(0,0,0,.08)":"none",transition:"all .2s"}}>{m.l}</button>
        ))}
      </div>

      {/* Verse card */}
      <div key={ak} onClick={nV} style={{maxWidth:380,width:"90%",padding:"36px 28px 24px",background:"rgba(255,255,255,.65)",borderRadius:28,backdropFilter:"blur(20px)",border:"1px solid rgba(255,255,255,.5)",boxShadow:`0 8px 40px ${P.teal}12`,textAlign:"center",cursor:mode==="random"?"pointer":"default",animation:"fadeUp .6s ease-out",position:"relative",overflow:"hidden"}}>
        {rip&&<div style={{position:"absolute",top:"50%",left:"50%",width:20,height:20,borderRadius:"50%",background:`${P.seafoam}44`,transform:"translate(-50%,-50%)",animation:"rippleOut .6s ease-out forwards"}}/>}
        <div style={{width:32,height:32,borderRadius:"50%",border:`1px solid ${P.seafoam}44`,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px"}}>
          <div style={{width:3,height:12,background:P.driftwood,borderRadius:2,position:"relative"}}><div style={{position:"absolute",top:4,left:-4,width:11,height:2.5,background:P.driftwood,borderRadius:2}}/></div>
        </div>
        <p style={{fontFamily:"'Quicksand',sans-serif",fontSize:10,letterSpacing:".2em",textTransform:"uppercase",color:P.teal,marginBottom:14}}>{verse.ref}</p>
        <p style={{fontSize:20,fontStyle:"italic",fontWeight:300,color:P.deepWarm,lineHeight:1.7,marginBottom:16}}>"{verse.text}"</p>
        <div style={{width:30,height:1,background:`linear-gradient(90deg,transparent,${P.seafoam},transparent)`,margin:"0 auto 16px"}}/>

        {/* READ MORE - takes user to Bible reader */}
        <button onClick={e=>{e.stopPropagation();onReadMore(verse.book,verse.chapter,verse.sv)}} style={{padding:"10px 24px",borderRadius:20,background:`linear-gradient(135deg,${P.teal}18,${P.deepTeal}18)`,border:`1px solid ${P.teal}33`,cursor:"pointer",fontFamily:"'Quicksand',sans-serif",fontSize:11,color:P.deepTeal,letterSpacing:".05em",transition:"all .2s"}}>
          Read {verse.book} {verse.chapter} →
        </button>
      </div>

      {/* Action buttons */}
      <div style={{display:"flex",gap:12,marginTop:20,zIndex:5}}>
        <button onClick={tFav} style={{background:"rgba(255,255,255,.6)",border:"none",borderRadius:"50%",width:44,height:44,cursor:"pointer",fontSize:18,backdropFilter:"blur(10px)"}}>{isFav?"💕":"🤍"}</button>
        <button onClick={async()=>{try{await navigator.clipboard.writeText(`"${verse.text}" — ${verse.ref}\n\n✦ saltandscripture.com`);stf("Copied!","📋")}catch{stf("Ready!","📋")}}} style={{background:"rgba(255,255,255,.6)",border:"none",borderRadius:"50%",width:44,height:44,cursor:"pointer",fontSize:18,backdropFilter:"blur(10px)"}}>📋</button>
      </div>

      {mode==="random"&&<p style={{fontFamily:"'Quicksand',sans-serif",fontSize:11,color:P.softMuted,marginTop:14,zIndex:5}}>Tap the card for a new verse</p>}

      {/* Other translations */}
      <div style={{display:"flex",gap:6,marginTop:16,zIndex:5,flexWrap:"wrap",justifyContent:"center",padding:"0 20px"}}>
        {links.map(l=>(
          <a key={l.name} href={l.url} target="_blank" rel="noopener noreferrer" style={{padding:"5px 12px",borderRadius:14,background:"rgba(255,255,255,.5)",border:"1px solid rgba(255,255,255,.6)",textDecoration:"none",fontFamily:"'Quicksand',sans-serif",fontSize:9,color:P.driftwood,backdropFilter:"blur(8px)"}}>{l.icon} {l.name}</a>
        ))}
      </div>

      <Toast message={toast.message} visible={toast.visible} icon={toast.icon}/>
    </div>
  );
}

// ==========================================
// LANDING PAGE
// ==========================================
function Landing({onNavigate}){
  const [email,setEmail]=useState("");
  const [sub,setSub]=useState(false);

  return(
    <div style={{minHeight:"100vh",background:P.cream,fontFamily:"'Cormorant Garamond',Georgia,serif"}}>
      <style>{CSS}</style>
      {/* Hero */}
      <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",position:"relative",overflow:"hidden",padding:"40px 20px"}}>
        <Blob color={P.seafoam} opacity={.1} size="400px" top="-100px" left="-100px" delay={0}/>
        <Blob color={P.golden} opacity={.08} size="300px" top="55%" left="68%" delay={2}/>
        <Blob color={P.blushPink} opacity={.04} size="220px" top="18%" left="78%" delay={1}/>
        <div style={{position:"absolute",top:"18%",left:"50%",transform:"translateX(-50%)",width:600,height:600,borderRadius:"50%",background:`radial-gradient(circle,${P.sunlitSand}18 0%,transparent 70%)`,animation:"sunGlow 8s ease-in-out infinite",pointerEvents:"none"}}/>

        <nav style={{position:"absolute",top:0,left:0,right:0,display:"flex",justifyContent:"space-between",alignItems:"center",padding:"24px 40px",zIndex:10}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}><LogoSm size={24}/><span style={{fontFamily:"'Cormorant Garamond',serif",fontSize:16,fontWeight:500,color:P.driftwood}}>Salt & Scripture</span></div>
          <div style={{display:"flex",gap:20}}>
            {[{label:"Shop",view:null},{label:"Our Story",view:null},{label:"Bible",view:"bible"},{label:"Tap ✦",view:"tap"}].map(i=>(
              <a key={i.label} href="#" onClick={e=>{e.preventDefault();if(i.view)onNavigate(i.view)}} style={{fontFamily:"'Quicksand',sans-serif",fontSize:12,color:P.muted,textDecoration:"none",letterSpacing:".1em",textTransform:"uppercase"}}>{i.label}</a>
            ))}
          </div>
        </nav>

        <div style={{textAlign:"center",zIndex:2,animation:"fadeUp 1s ease-out",maxWidth:600}}>
          <p style={{fontFamily:"'Quicksand',sans-serif",fontSize:11,letterSpacing:".3em",textTransform:"uppercase",color:P.teal,marginBottom:24}}>Faith you can wear</p>
          <Logo size={72}/>
          <h1 style={{fontSize:"clamp(40px,7vw,68px)",fontWeight:300,color:P.driftwood,lineHeight:1.1,margin:"20px 0"}}>Salt &<br/><span style={{fontFamily:"'Dancing Script',cursive",fontWeight:400,color:P.teal}}>Scripture</span></h1>
          <p style={{fontFamily:"'Quicksand',sans-serif",fontSize:15,color:P.muted,lineHeight:1.7,maxWidth:440,margin:"0 auto 36px"}}>Beautiful jewelry that connects you to God's Word with a single tap. Read, highlight, and make it yours.</p>
          <div style={{display:"flex",gap:12,justifyContent:"center",flexWrap:"wrap"}}>
            <button style={{fontFamily:"'Quicksand',sans-serif",fontSize:12,letterSpacing:".15em",textTransform:"uppercase",padding:"16px 36px",background:`linear-gradient(135deg,${P.teal},${P.deepTeal})`,color:P.cream,border:"none",borderRadius:30,cursor:"pointer",boxShadow:`0 4px 20px ${P.teal}33`}}>Shop Now</button>
            <button onClick={()=>onNavigate("tap")} style={{fontFamily:"'Quicksand',sans-serif",fontSize:12,letterSpacing:".15em",textTransform:"uppercase",padding:"16px 36px",background:"rgba(255,255,255,.6)",color:P.driftwood,border:`1px solid ${P.seafoam}66`,borderRadius:30,cursor:"pointer",backdropFilter:"blur(10px)"}}>Try a Tap ✦</button>
            <button onClick={()=>onNavigate("bible")} style={{fontFamily:"'Quicksand',sans-serif",fontSize:12,letterSpacing:".15em",textTransform:"uppercase",padding:"16px 36px",background:"rgba(255,255,255,.6)",color:P.driftwood,border:`1px solid ${P.golden}66`,borderRadius:30,cursor:"pointer",backdropFilter:"blur(10px)"}}>📖 Read the Bible</button>
          </div>
        </div>
      </div>

      {/* Your Personal Bible — simplified, no feature callouts */}
      <div style={{padding:"70px 20px",textAlign:"center"}}>
        <h2 style={{fontSize:32,fontWeight:300,color:P.driftwood,marginBottom:12}}>Your Personal Bible</h2>
        <p style={{fontFamily:"'Quicksand',sans-serif",fontSize:14,color:P.muted,maxWidth:480,margin:"0 auto 30px",lineHeight:1.7}}>Read the full KJV Bible right here. Highlight your favorite passages, write personal reflections, and save verses that speak to you.</p>
        <button onClick={()=>onNavigate("bible")} style={{padding:"14px 32px",borderRadius:30,background:`linear-gradient(135deg,${P.teal},${P.deepTeal})`,color:P.cream,border:"none",cursor:"pointer",fontFamily:"'Quicksand',sans-serif",fontSize:12,letterSpacing:".1em",textTransform:"uppercase",boxShadow:`0 4px 16px ${P.teal}33`}}>Open Bible Reader</button>

        {/* Other translations */}
        <div style={{marginTop:28}}>
          <p style={{fontFamily:"'Quicksand',sans-serif",fontSize:11,color:P.softMuted,marginBottom:12}}>Also explore other translations</p>
          <div style={{display:"flex",gap:8,justifyContent:"center",flexWrap:"wrap"}}>
            {getBibleLinks("Genesis",1).map(l=>(
              <a key={l.name} href={l.url} target="_blank" rel="noopener noreferrer" style={{padding:"8px 16px",borderRadius:18,background:`${l.color}15`,border:`1px solid ${l.color}25`,textDecoration:"none",fontFamily:"'Quicksand',sans-serif",fontSize:11,color:P.driftwood,display:"flex",alignItems:"center",gap:5}}>
                {l.icon} {l.name} <span style={{fontSize:9,color:P.softMuted}}>· {l.desc}</span>
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* How it works */}
      <div style={{padding:"50px 20px",background:`${P.seafoam}08`}}>
        <div style={{maxWidth:700,margin:"0 auto",display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:16,textAlign:"center"}}>
          {[{step:"1",title:"Tap Your Jewelry",desc:"Hold your phone to the NFC tag"},{step:"2",title:"Read God's Word",desc:"A beautiful verse appears instantly"},{step:"3",title:"Make It Yours",desc:"Highlight, note, save, share"}].map(s=>(
            <div key={s.step}><div style={{width:40,height:40,borderRadius:"50%",background:`linear-gradient(135deg,${P.teal},${P.deepTeal})`,color:P.cream,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 10px",fontFamily:"'Quicksand',sans-serif",fontSize:14,fontWeight:600}}>{s.step}</div><h3 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:16,fontWeight:400,color:P.driftwood,marginBottom:4}}>{s.title}</h3><p style={{fontFamily:"'Quicksand',sans-serif",fontSize:11,color:P.muted,lineHeight:1.5}}>{s.desc}</p></div>
          ))}
        </div>
      </div>

      {/* Newsletter */}
      <div style={{padding:"60px 20px",background:`linear-gradient(170deg,${P.mistBlue}20 0%,${P.seafoam}20 50%,${P.sunlitSand}20 100%)`,textAlign:"center"}}>
        <p style={{fontFamily:"'Dancing Script',cursive",fontSize:22,color:P.teal,marginBottom:6}}>coming soon</p>
        <h2 style={{fontSize:28,fontWeight:300,color:P.driftwood,marginBottom:12}}>Be the First to Know</h2>
        <p style={{fontFamily:"'Quicksand',sans-serif",fontSize:13,color:P.muted,maxWidth:380,margin:"0 auto 24px"}}>Early access, launch discounts, and free verse wallpapers.</p>
        {!sub?<div style={{display:"flex",gap:10,justifyContent:"center",maxWidth:360,margin:"0 auto"}}><input type="email" placeholder="your email" value={email} onChange={e=>setEmail(e.target.value)} style={{flex:1,padding:"12px 18px",borderRadius:30,border:`1px solid ${P.seafoam}55`,background:"rgba(255,255,255,.7)",fontFamily:"'Quicksand',sans-serif",fontSize:13,color:P.deepWarm,outline:"none"}}/><button onClick={()=>setSub(true)} style={{padding:"12px 22px",borderRadius:30,border:"none",background:`linear-gradient(135deg,${P.teal},${P.deepTeal})`,color:P.cream,fontFamily:"'Quicksand',sans-serif",fontSize:12,letterSpacing:".1em",textTransform:"uppercase",cursor:"pointer"}}>Join</button></div>:<p style={{fontFamily:"'Cormorant Garamond',serif",fontSize:18,fontStyle:"italic",color:P.deepTeal}}>✦ You're on the list!</p>}
      </div>

      {/* Footer */}
      <div style={{padding:"32px 20px",background:`linear-gradient(135deg,${P.driftwood},${P.deepWarm})`,textAlign:"center"}}><Logo size={30} light/><p style={{fontFamily:"'Cormorant Garamond',serif",fontSize:15,color:P.cream,margin:"8px 0"}}>Salt & Scripture</p><p style={{fontFamily:"'Quicksand',sans-serif",fontSize:9,color:`${P.cream}44`}}>© 2026 Salt & Scripture · Wear the Word</p></div>

      {/* Fixed CTAs */}
      <div style={{position:"fixed",bottom:20,right:20,zIndex:100,display:"flex",gap:8}}>
        <button onClick={()=>onNavigate("bible")} style={{padding:"10px 18px",borderRadius:20,background:"rgba(255,255,255,.88)",border:`1px solid ${P.golden}44`,cursor:"pointer",fontFamily:"'Quicksand',sans-serif",fontSize:11,color:P.driftwood,backdropFilter:"blur(10px)",boxShadow:`0 2px 12px ${P.teal}12`}}>📖 Bible</button>
        <button onClick={()=>onNavigate("tap")} style={{padding:"10px 18px",borderRadius:20,background:"rgba(255,255,255,.88)",border:`1px solid ${P.seafoam}44`,cursor:"pointer",fontFamily:"'Quicksand',sans-serif",fontSize:11,color:P.driftwood,backdropFilter:"blur(10px)",boxShadow:`0 2px 12px ${P.teal}12`}}>Try the Tap ✦</button>
      </div>
    </div>
  );
}

// ==========================================
// APP ROOT — shared state across views
// ==========================================
export default function App(){
  const [view,setView]=useState("landing");
  const [bibleTarget,setBibleTarget]=useState({book:"Genesis",chapter:1,verse:null});
  const [favorites,setFavorites]=useState([]);
  const [highlights,setHighlights]=useState({});
  const [notes,setNotes]=useState({});
  const [bookmarks,setBookmarks]=useState([]);
  const [showSaved,setShowSaved]=useState(false);

  const goToBible=(book,chapter,verse=null)=>{
    setBibleTarget({book,chapter,verse});
    setView("bible");
  };

  const savedCount = favorites.length + bookmarks.length + Object.keys(highlights).length + Object.keys(notes).length;

  if(view==="bible") return(
    <>
      <FullBibleReader
        onBack={()=>setView("landing")}
        initialBook={bibleTarget.book}
        initialChapter={bibleTarget.chapter}
        initialVerse={bibleTarget.verse}
        highlights={highlights} setHighlights={setHighlights}
        notes={notes} setNotes={setNotes}
        bookmarks={bookmarks} setBookmarks={setBookmarks}
      />
      {/* Floating saved button */}
      <div style={{position:"fixed",bottom:20,right:20,zIndex:90}}>
        <button onClick={()=>setShowSaved(true)} style={{padding:"10px 16px",borderRadius:20,background:"rgba(255,255,255,.9)",border:`1px solid ${P.golden}44`,cursor:"pointer",fontFamily:"'Quicksand',sans-serif",fontSize:11,color:P.driftwood,backdropFilter:"blur(10px)",boxShadow:`0 2px 12px ${P.teal}12`,display:"flex",alignItems:"center",gap:5}}>
          ✦ My Collection {savedCount>0&&<span style={{background:`${P.teal}22`,padding:"1px 7px",borderRadius:10,fontSize:10,color:P.deepTeal}}>{savedCount}</span>}
        </button>
      </div>
      <SavedPanel visible={showSaved} onClose={()=>setShowSaved(false)} favorites={favorites} bookmarks={bookmarks} highlights={highlights} notes={notes} onNavigate={(b,c,v)=>{setBibleTarget({book:b,chapter:c,verse:v});setView("bible")}}/>
    </>
  );

  if(view==="tap") return(
    <>
      <TapExp onBack={()=>setView("landing")} onReadMore={(b,c,v)=>goToBible(b,c,v)} favorites={favorites} setFavorites={setFavorites}/>
      {savedCount>0&&<div style={{position:"fixed",bottom:20,left:20,zIndex:90}}>
        <button onClick={()=>setShowSaved(true)} style={{padding:"10px 16px",borderRadius:20,background:"rgba(255,255,255,.9)",border:`1px solid ${P.golden}44`,cursor:"pointer",fontFamily:"'Quicksand',sans-serif",fontSize:11,color:P.driftwood,backdropFilter:"blur(10px)",boxShadow:`0 2px 12px ${P.teal}12`}}>✦ {savedCount}</button>
      </div>}
      <SavedPanel visible={showSaved} onClose={()=>setShowSaved(false)} favorites={favorites} bookmarks={bookmarks} highlights={highlights} notes={notes} onNavigate={(b,c,v)=>goToBible(b,c,v)}/>
    </>
  );

  return(
    <>
      <Landing onNavigate={v=>{if(v==="bible")goToBible("Genesis",1);else setView(v)}}/>
      {savedCount>0&&<div style={{position:"fixed",bottom:20,left:20,zIndex:90}}>
        <button onClick={()=>setShowSaved(true)} style={{padding:"10px 16px",borderRadius:20,background:"rgba(255,255,255,.9)",border:`1px solid ${P.golden}44`,cursor:"pointer",fontFamily:"'Quicksand',sans-serif",fontSize:11,color:P.driftwood,backdropFilter:"blur(10px)",boxShadow:`0 2px 12px ${P.teal}12`}}>✦ My Collection ({savedCount})</button>
      </div>}
      <SavedPanel visible={showSaved} onClose={()=>setShowSaved(false)} favorites={favorites} bookmarks={bookmarks} highlights={highlights} notes={notes} onNavigate={(b,c,v)=>goToBible(b,c,v)}/>
    </>
  );
}
