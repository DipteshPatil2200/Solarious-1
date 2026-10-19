import type { Metadata } from "next";
import QuoteWizard from "@/components/quote-wizard";
import { company, products } from "@/data/site";
import InnerPageHero from "@/components/inner-page-hero";
export const metadata:Metadata={title:"Request a Quote",description:"Submit project and solar module requirements to the Solarious Energy team."};
const initialProduct=(value:string|string[]|undefined)=>{const requested=Array.isArray(value)?value[0]||"":String(value||"").trim();if(!requested)return"";return products.find(product=>product.slug===requested.toLowerCase())?.name||requested};
export default async function Page({searchParams}:{searchParams:Promise<{product?:string|string[]}>}){const {product}=await searchParams;return <main className="quote-page"><InnerPageHero eyebrow="Project inquiry" title="Request a Solar Quote" description="Share your project details through a guided five-step form. Confirmed specifications and pricing are provided by the Solarious team."/><QuoteWizard initialProduct={initialProduct(product)}/><p className="quote-contact-note">For quotation assistance, email <a href={`mailto:${company.email}`}>{company.email}</a>.</p></main>}
