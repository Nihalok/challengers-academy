import { useRef } from 'react';
import { Download, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import jsPDF from 'jspdf';
import { useGsapReveal } from './hooks/useGsapReveal';
import SEO from './components/SEO';

export default function Waiver() {
  const waiverRef = useRef<HTMLDivElement>(null);
  useGsapReveal();

  const handleDownloadPDF = () => {
    try {
      // Create a standard Letter size PDF (8.5in x 11in = 612pt x 792pt)
      const pdf = new jsPDF('p', 'pt', 'letter');
      const margin = 54; // 0.75 in margin
      const pageWidth = 612;
      const contentWidth = pageWidth - margin * 2; // 504pt
      let y = margin;

      // Helper for adding paragraphs with clean line wrapping
      const addParagraph = (text: string, spaceAfter = 18, font = 'normal', fontSize = 10, align: 'left' | 'center' = 'left') => {
        pdf.setFont('helvetica', font);
        pdf.setFontSize(fontSize);
        const lines = pdf.splitTextToSize(text, contentWidth);
        const lineHeight = fontSize * 1.35;
        
        lines.forEach((line: string) => {
          if (align === 'center') {
            pdf.text(line, pageWidth / 2, y, { align: 'center' });
          } else {
            pdf.text(line, margin, y);
          }
          y += lineHeight;
        });
        y += spaceAfter;
      };

      // ── PAGE 1 ──────────────────────────────────────────────
      y = 64;
      // Header Title
      addParagraph('General Waiver', 24, 'bold', 18, 'center');

      // Paragraph 1
      addParagraph(
        `I understand that observation of or physical activity in, including but not limited to hitting, passing, jumping and blocking can be a dangerous activity and that, by participating in those activities like (“Volleyball Coaching”), I am taking a risk that my child may be injured. I hereby assume all the risk described above, even if the Challengers Volleyball Coaching Center like Clinics, Camps and training activities organized by Wilson Mathew Challengers Volleyball Coaching Center program at any Gym, School, Park or facility in California. Any of the aforementioned Parties, Owners, Members, Coaches, Employees or Agents, through negligence or otherwise, are deemed liable. I hereby release, waive, discharge covenant not to sue Challengers Volleyball Coaching Center, California or any of the aforementioned Parties’ Owners, Members, Coaches, Employees or Agents (individually and together herein referred to as “Released Parties”),`,
        16,
        'normal',
        10
      );

      // Paragraph 2
      addParagraph(
        `Consent to use of Likeness: I understand and agree that photographs, Videos and other recordings of participants may be taken, and that such pictures or videos of me and/or my child may be used for promotional purposes. I hereby consent to the publication and use of my and/or my child’s name or likeness for the purpose for the promotion, publicity, advertising, or other manner or media by the city or any other representative authorized to act on behalf of the aforementioned entities. I agree that the actual material involved is and shall continue to the property of the city and that neither I, nor my child, shall have any right of review or approval regarding the use of me and/or my child’s likeness in such material.`,
        16,
        'normal',
        10
      );

      // Paragraph 3
      addParagraph(
        `Owners and tenants of premises used to conduct the Volleyball Activities, from any and all liability arising out of my or my child’s observation of and participation in the Volleyball Activities and/or event, even if the liability arises out of negligence that may not be foreseeable at this time. I understand that by signing this Waiver and Release, I expressly and willingly agree to assume complete responsibility for any risk of injury or damages that may arise from the related activity. On behalf of myself, my children, heirs, assigns and next of kin, I waive all claims for damages, injuries, and death sustained to me, my children or my property, that I may have against the above-named Released Parties, any of its owners, employees or representatives relating to such activity. I understand that the activities that I or my child will participate in are inherently dangerous and may cause serious injuries, including body injury, damage to personal property and/or death. By this waiver, I assume any and all risk, and take full responsibility and waive any and all claims of personal injury upon myself or my child, including severe body injury, damage to personal property and death relating to all activities associated with the activity, including but not limited to practice, receiving lessons at the facility, using the facility and its equipment and related activities on and off the activity premises. If I or my`,
        16,
        'normal',
        10
      );

      // Footer Page 1
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8);
      pdf.text('Page 1 of 2 — Challengers Volleyball Academy General Waiver', pageWidth / 2, 750, { align: 'center' });

      // ── PAGE 2 ──────────────────────────────────────────────
      pdf.addPage();
      y = 60;

      // Paragraph 4
      addParagraph(
        `children are injured from said activity, I will not hold the above named Released Parties responsible even if the injuries were caused by negligence on my part or the Released Parties, any of its owners, employees or representatives, or any other party under or affiliated with the above named Released Parties. I represent that my minor child or I are in sufficiently good physical condition to participate in the programs and activities without jeopardizing our health.`,
        16,
        'normal',
        10
      );

      // Paragraph 5
      addParagraph(
        `I understand that I have given up substantial rights by signing this waiver and release, and sign it voluntarily. This waiver and release also binds my heirs and assigners. The undersigned, my parent or legal guardian, and I if I am a minor, in consideration of being allowed participating in the activity, and all related events and activities:`,
        16,
        'normal',
        10
      );

      // Hold Harmless Box
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(9);
      const boxText = `*HOLD HARMLESS MEDICAL RELEASE DUE TO THE NATURE OF ACTIVITY, IT IS UNDERSTOOD THAT I RELEASE THE RELEASED PARTIES (DEFINED ABOVE) FROM ALL LIABILITY OF ANY SORT, AND THAT THEY BE HELD HARMLESS AND INDEMNIFIED FOR ANY ACCIDENT OR INJURIES SUSTAINED BY ME/MY CHILDREN WHILE INVOLVED IN THE VOLLEYBALL ACTIVITY.`;
      const boxLines = pdf.splitTextToSize(boxText, contentWidth - 20);
      const boxHeight = boxLines.length * 13 + 16;
      
      pdf.setDrawColor(200, 200, 200);
      pdf.setFillColor(250, 250, 250);
      pdf.rect(margin, y, contentWidth, boxHeight, 'F');
      pdf.rect(margin, y, contentWidth, boxHeight, 'S');

      let boxY = y + 14;
      boxLines.forEach((line: string) => {
        pdf.text(line, margin + 10, boxY);
        boxY += 13;
      });

      y += boxHeight + 24;

      // Form Fields
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10);
      
      // Name
      pdf.text('Name ______________________________________________________________________', margin, y);
      y += 24;

      // Age
      pdf.text('Age: ________________________', margin, y);
      y += 24;

      // Address
      pdf.text('Address ________________________________________________________________________', margin, y);
      y += 24;

      // City State Zip
      pdf.text('City ______________________________   State ________________________   zip _________________', margin, y);
      y += 24;

      // Phone
      pdf.text('Phone (_______) ________________________________________________________________', margin, y);
      y += 24;

      // Emergency Contact
      pdf.text('In Case Of Emergency, please contact (NAME & PHONE #)', margin, y);
      y += 18;
      pdf.text('_______________________________________________________________________________', margin, y);
      y += 36;

      // Player Signature
      pdf.setFont('helvetica', 'bold');
      pdf.text('PLAYER SIGNATURE, If over 18', margin, y);
      y += 18;
      pdf.setFont('helvetica', 'normal');
      pdf.text('X ______________________________________________________________________________', margin, y);
      y += 36;

      // Parent Signature
      pdf.setFont('helvetica', 'bold');
      pdf.text('PARENT SIGNATURE (if player is under 18)', margin, y);
      y += 18;
      pdf.setFont('helvetica', 'normal');
      pdf.text('X ______________________________________________________________________________', margin, y);

      // Footer Page 2
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8);
      pdf.text('Page 2 of 2 — Challengers Volleyball Academy General Waiver', pageWidth / 2, 750, { align: 'center' });

      // Save PDF
      pdf.save('Challengers_Volleyball_General_Waiver.pdf');
    } catch (error) {
      console.error('Error generating Waiver PDF:', error);
    }
  };

  return (
    <div className="pt-32 sm:pt-36 md:pt-40 pb-16 bg-[#FBF9F6] min-h-screen font-sans text-espresso selection:bg-[#D62828] selection:text-white">
      <SEO 
        title="General Liability Waiver | Challengers Volleyball Academy"
        description="Official Athletic Participation Waiver & Release of Liability for Challengers Volleyball Academy."
      />

      <div className="container mx-auto px-4 max-w-5xl">
        
        {/* Page Header */}
        <div className="gsap-reveal mb-10 text-center">
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="h-px w-10 bg-[#D62828]" />
            <span className="text-[#D62828] font-black text-[10px] tracking-[0.4em] uppercase">Official Documentation</span>
          </div>
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-sans font-black text-espresso uppercase tracking-tight leading-[0.95] mb-4">
            General Participation <span className="text-[#D62828] italic font-serif">Waiver.</span>
          </h1>
          
          <p className="text-espresso/75 text-sm sm:text-base font-normal max-w-2xl mx-auto mb-8 leading-relaxed">
            Please review the official General Waiver and Release of Liability below. All participants must have a signed waiver on file prior to court training.
          </p>

          <button 
            onClick={handleDownloadPDF}
            className="inline-flex items-center gap-3 bg-[#D62828] text-white px-8 py-4 rounded-xl text-xs font-black uppercase tracking-[0.2em] hover:bg-espresso transition-all shadow-lg active:scale-95"
          >
            <Download className="w-4 h-4" /> Download Official 2-Page PDF
          </button>
        </div>

        {/* ── 2-PAGE DOCUMENT PREVIEW CARD ──────────────────────────── */}
        <div className="gsap-reveal space-y-8" ref={waiverRef}>
          
          {/* PAGE 1 PREVIEW */}
          <div className="bg-white rounded-3xl p-8 sm:p-12 md:p-16 border border-espresso/10 shadow-xl max-w-4xl mx-auto relative">
            <div className="absolute top-6 right-6 px-3 py-1 bg-espresso/5 rounded-full text-[9px] font-black uppercase tracking-widest text-espresso/40">
              Page 1 of 2
            </div>

            <div className="text-center mb-10 border-b border-espresso/10 pb-6">
              <h2 className="text-2xl sm:text-3xl font-black uppercase text-espresso tracking-tight">
                General Waiver
              </h2>
              <p className="text-[10px] font-bold uppercase tracking-widest text-espresso/50 mt-1">
                Challengers Volleyball Coaching Center
              </p>
            </div>

            <div className="space-y-6 text-xs sm:text-sm text-espresso/80 leading-relaxed font-normal">
              <p>
                I understand that observation of or physical activity in,including but not limited to hitting,passing, jumping and blocking can be a dangerous activity and that, by participating in those activities like (“Volleyball Coaching”), I am taking a risk that my child may be injured.I hereby assume all the risk described above, even if the Challengers Volleyball Coaching Center like Clinics, Camps and training activities organized by Wilson Mathew Challengers Volleyball Coaching Center program at any Gym,School, Park or facility in California. Any of the aforementioned Parties, Owners, Members, Coaches, Employees or Agents, through negligence or otherwise, are deemed liable. I hereby release, waive,discharge covenant not to sue Challengers Volleyball Coaching Center, California or any of the aforementioned Parties’ Owners, Members, Coaches, Employees or Agents (individually and together herein referred to as “Released Parties”),
              </p>

              <p>
                <strong className="text-espresso font-bold">Consent to use of Likeness:</strong> I understand and agree that photographs,Videos and other recordings of participants may be taken, and that such pictures or videos of me and/or my child may be used for promotional purposes.I hereby consent to the publication and use of my and/or my child’s name or likeness for the purpose for the promotion, publicity ,advertising,or other manner or media by the city or any other representative authorized to act on behalf of the aforementioned entities. I agree that the actual material involved is and shall continue to the property of the city and that neither I ,nor my child, shall have any right of review or approval regarding the use of me and/or my child’s likeness in such material.
              </p>

              <p>
                Owners and tenants of premises used to conduct the Volleyball Activities, from any and all liability arising out of my or my child’s observation of and participation in the Volleyball Activities and/or event, even if the liability arises out of negligence that may not be foreseeable at this time.I understand that by signing this Waiver and Release, I expressly and willingly agree to assume complete responsibility for any risk of injury or damages that may arise from the related activity. On behalf of myself, my children, heirs, assigns and next of kin, I waive all claims for damages, injuries, and death sustained to me, my children or my property, that I may have against the above-named Released Parties, any of its owners, employees or representatives relating to such activity. I understand that the activities that I or my child will participate in are inherently dangerous and may cause serious injuries, including body injury, damage to personal property and/or death. By this waiver, I assume any and all risk,and take full responsibility and waive any and all claims of personal injury upon myself or my child, including severe body injury, damage to personal property and death relating to all activities associated with the activity, including but not limited to practice, receiving lessons at the facility, using the facility and its equipment and related activities on and off the activity premises. If I or my
              </p>
            </div>
          </div>

          {/* PAGE 2 PREVIEW */}
          <div className="bg-white rounded-3xl p-8 sm:p-12 md:p-16 border border-espresso/10 shadow-xl max-w-4xl mx-auto relative">
            <div className="absolute top-6 right-6 px-3 py-1 bg-espresso/5 rounded-full text-[9px] font-black uppercase tracking-widest text-espresso/40">
              Page 2 of 2
            </div>

            <div className="space-y-6 text-xs sm:text-sm text-espresso/80 leading-relaxed font-normal mb-8">
              <p>
                children are injured from said activity, I will not hold the above named Released Parties responsible even if the injuries were caused by negligence on my part or the Released Parties, any of its owners, employees or representatives, or any other party under or affiliated with the above named Released Parties. I represent that my minor child or I are in sufficiently good physical condition to participate in the programs and activities without jeopardizing our health.
              </p>

              <p>
                I understand that I have given up substantial rights by signing this waiver and release, and sign it voluntarily.This waiver and release also binds my heirs and assigners. The undersigned, my parent or legal guardian, and I if I am a minor, in consideration of being allowed participating in the activity, and all related events and activities:
              </p>

              <div className="p-4 sm:p-5 bg-amber-50/80 rounded-2xl border border-amber-200 text-amber-950 text-xs sm:text-sm font-bold leading-normal">
                *HOLD HARMLESS MEDICAL RELEASE DUE TO THE NATURE OF ACTIVITY, IT I UNDERSTOOD THAT I RELEASE THERE LEASED PARTIES (DEFINED ABOVE) FROM ALL LIABILITY OF ANY SORT, AND THAT THEY BE HELD HARMLESS AND INDEMENIFIED FORANY ACCIDENT OR INJURIES SUSTAINED BY ME/MY CHILDREN WHILE INVOLVED IN THE VOLLEYBALL ACTIVITY.
              </div>
            </div>

            {/* Form Fields & Signature Lines */}
            <div className="pt-6 border-t border-espresso/10 space-y-6 text-xs sm:text-sm text-espresso font-semibold">
              <div className="border-b border-espresso/30 pb-2">
                Name ______________________________________________________________________
              </div>

              <div className="border-b border-espresso/30 pb-2">
                Age: ________________________
              </div>

              <div className="border-b border-espresso/30 pb-2">
                Address ________________________________________________________________________
              </div>

              <div className="border-b border-espresso/30 pb-2">
                City ______________________________ State ________________________ zip _________________
              </div>

              <div className="border-b border-espresso/30 pb-2">
                Phone (_______) ________________________________________________________________
              </div>

              <div className="border-b border-espresso/30 pb-2">
                In Case Of Emergency, please contact (NAME & PHONE #)
                <div className="mt-1 text-espresso/40">_______________________________________________________________________________</div>
              </div>

              <div className="pt-4 space-y-6">
                <div>
                  <span className="block font-black uppercase text-xs tracking-wider text-espresso/80 mb-1">PLAYER SIGNATURE, If over 18</span>
                  <div className="border-b-2 border-espresso pb-2">X ______________________________________________________________________________</div>
                </div>

                <div>
                  <span className="block font-black uppercase text-xs tracking-wider text-espresso/80 mb-1">PARENT SIGNATURE (if player is under 18)</span>
                  <div className="border-b-2 border-espresso pb-2">X _____________________________________________________________________________</div>
                </div>
              </div>
            </div>

          </div>

          {/* Bottom Action Button */}
          <div className="text-center pt-4">
            <button 
              onClick={handleDownloadPDF}
              className="inline-flex items-center gap-3 bg-[#D62828] text-white px-8 py-4 rounded-xl text-xs font-black uppercase tracking-[0.2em] hover:bg-espresso transition-all shadow-lg active:scale-95"
            >
              <Download className="w-4 h-4" /> Download Official 2-Page PDF
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}

