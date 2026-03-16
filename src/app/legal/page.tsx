import Link from "next/link";

export default function LegalPage() {
  return (
    <div className="bg-white min-h-screen">
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-white/80 border-b border-[#F0F0EE]">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between h-14">
          <Link href="/" className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-[15px] font-semibold text-[#37352F] tracking-tight">Claimless</span>
          </Link>
          <Link href="/" className="text-[13px] text-[#9B9A97] hover:text-[#37352F] transition-colors">
            Back to home
          </Link>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 pt-28 pb-20">
        <h1 className="text-[36px] font-bold text-[#37352F] tracking-tight">Privacy Policy & Terms of Service</h1>
        <p className="text-[14px] text-[#9B9A97] mt-2">Last updated: March 2026</p>

        <div className="mt-12 space-y-12">
          {/* Privacy Policy */}
          <section>
            <h2 className="text-[24px] font-bold text-[#37352F] mb-6">Privacy Policy</h2>

            <div className="space-y-6 text-[14px] text-[#37352F] leading-relaxed">
              <div>
                <h3 className="font-semibold text-[16px] mb-2">1. Who we are</h3>
                <p className="text-[#9B9A97]">
                  Claimless is an AI-powered recruitment screening platform operated by Automation Experts. We help recruitment agencies and companies verify candidate skills through intelligent screening and AI voice interviews. Our platform is built in Australia and designed for the Australian recruitment market.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-[16px] mb-2">2. What data we collect</h3>
                <p className="text-[#9B9A97] mb-3">When candidates apply through our platform, we collect:</p>
                <ul className="list-disc pl-5 space-y-1 text-[#9B9A97]">
                  <li>Name, email address, phone number</li>
                  <li>Resume/CV content (text extracted from uploaded PDFs)</li>
                  <li>Uploaded project files and supporting documents</li>
                  <li>LinkedIn URL, GitHub username, portfolio URL</li>
                  <li>Loom video URLs and transcripts (if submitted)</li>
                  <li>Voice interview recordings and transcripts</li>
                  <li>Custom form responses (answers to application questions)</li>
                  <li>AI-generated screening scores and assessments</li>
                </ul>
                <p className="text-[#9B9A97] mt-3">For company users, we collect name, email, and role within the organisation.</p>
              </div>

              <div>
                <h3 className="font-semibold text-[16px] mb-2">3. How we use your data</h3>
                <ul className="list-disc pl-5 space-y-1 text-[#9B9A97]">
                  <li>To screen candidates against job requirements using AI analysis</li>
                  <li>To conduct AI voice interviews and generate scored assessments</li>
                  <li>To provide recruitment agencies with verified candidate reports</li>
                  <li>To send application status notifications (screening results, interview invitations)</li>
                  <li>To improve our AI models and screening accuracy (aggregated, anonymised data only)</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-[16px] mb-2">4. AI processing</h3>
                <p className="text-[#9B9A97]">
                  Your application data is processed by AI systems including OpenAI (GPT-5 for voice interviews), Anthropic (Claude for screening and scoring), Deepgram (speech-to-text), and ElevenLabs (text-to-speech). These third-party AI providers process data under their respective data processing agreements. We do not use candidate data to train AI models. AI-generated assessments are advisory and subject to human review by the hiring company.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-[16px] mb-2">5. Data storage and security</h3>
                <p className="text-[#9B9A97]">
                  Data is stored in Supabase (PostgreSQL database hosted on AWS). Uploaded files are stored in Supabase Storage. All data is encrypted in transit (TLS) and at rest. Access is controlled through row-level security policies scoped to each company. We do not sell candidate data to third parties.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-[16px] mb-2">6. Data retention and deletion</h3>
                <p className="text-[#9B9A97]">
                  Candidate data is retained for as long as the hiring company maintains an active account. Candidates can request deletion of their personal data at any time by contacting us at hello@claimless.com. Upon request, we anonymise all personal information (name set to &quot;[Deleted]&quot;, email and phone removed) while preserving aggregate scores for reporting purposes. This complies with the Australian Privacy Act 1988.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-[16px] mb-2">7. Australian Privacy Principles</h3>
                <p className="text-[#9B9A97]">
                  We comply with the 13 Australian Privacy Principles (APPs) under the Privacy Act 1988. Our AI interview system is designed to never ask about protected attributes including age, marital status, race, religion, disability, or sexual orientation. Full audit trails are maintained for every interview for compliance review.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-[16px] mb-2">8. Cookies and analytics</h3>
                <p className="text-[#9B9A97]">
                  We use essential cookies for authentication. We use Sentry for error monitoring (no personal data collected). We do not use advertising cookies or third-party tracking.
                </p>
              </div>
            </div>
          </section>

          <div className="border-t border-[#E9E9E7]" />

          {/* Terms of Service */}
          <section>
            <h2 className="text-[24px] font-bold text-[#37352F] mb-6">Terms of Service</h2>

            <div className="space-y-6 text-[14px] text-[#37352F] leading-relaxed">
              <div>
                <h3 className="font-semibold text-[16px] mb-2">1. Service description</h3>
                <p className="text-[#9B9A97]">
                  Claimless provides AI-powered candidate screening, video analysis, and voice interview services to recruitment agencies and hiring companies. Our platform analyses candidate applications, conducts automated voice interviews, and generates scored assessment reports.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-[16px] mb-2">2. Account responsibilities</h3>
                <p className="text-[#9B9A97]">
                  Company accounts are responsible for maintaining the confidentiality of their login credentials and API keys. You are responsible for all activity that occurs under your account. You must have appropriate consent from candidates to process their data through our platform.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-[16px] mb-2">3. Fair use</h3>
                <p className="text-[#9B9A97]">
                  Our platform includes rate limiting to prevent abuse. You agree not to use the platform to discriminate against candidates based on protected attributes. You agree not to use automated tools to spam the application or interview endpoints. We reserve the right to suspend accounts that violate fair use policies.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-[16px] mb-2">4. AI assessments</h3>
                <p className="text-[#9B9A97]">
                  AI-generated scores and recommendations are advisory tools, not final hiring decisions. The hiring company retains full responsibility for all employment decisions. Claimless does not guarantee the accuracy of AI assessments and recommends human review of all candidate evaluations before making hiring decisions.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-[16px] mb-2">5. White-label usage</h3>
                <p className="text-[#9B9A97]">
                  Companies using white-label features may display their own branding on candidate-facing pages. &quot;Powered by Claimless&quot; attribution must remain visible on all candidate-facing pages. White-label companies are responsible for ensuring their use of the platform complies with applicable employment and anti-discrimination laws.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-[16px] mb-2">6. Data ownership</h3>
                <p className="text-[#9B9A97]">
                  Companies own their job listings, settings, and team configurations. Candidates own their personal data and can request deletion. AI-generated assessments (scores, transcripts, reports) are licensed to the hiring company for the duration of their account. Claimless retains the right to use anonymised, aggregated data for platform improvement.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-[16px] mb-2">7. Service availability</h3>
                <p className="text-[#9B9A97]">
                  We aim for high availability but do not guarantee 100% uptime. Our platform depends on third-party services (Supabase, Vercel, OpenAI, Anthropic, Vapi, Deepgram, ElevenLabs) and their availability. We are not liable for service interruptions caused by third-party outages.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-[16px] mb-2">8. Limitation of liability</h3>
                <p className="text-[#9B9A97]">
                  To the maximum extent permitted by Australian law, Claimless is not liable for any indirect, incidental, or consequential damages arising from the use of our platform. Our total liability is limited to the amount paid by the company in the 12 months preceding the claim.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-[16px] mb-2">9. Governing law</h3>
                <p className="text-[#9B9A97]">
                  These terms are governed by the laws of New South Wales, Australia. Any disputes arising from these terms will be resolved in the courts of New South Wales.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-[16px] mb-2">10. Changes to these terms</h3>
                <p className="text-[#9B9A97]">
                  We may update these terms from time to time. We will notify registered users of material changes via email. Continued use of the platform after changes constitutes acceptance of the updated terms.
                </p>
              </div>
            </div>
          </section>

          <div className="border-t border-[#E9E9E7] pt-8">
            <p className="text-[13px] text-[#9B9A97]">
              Questions about our privacy policy or terms? Contact us at{" "}
              <a href="mailto:hello@claimless.com" className="text-[#2383E2] hover:underline">hello@claimless.com</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
