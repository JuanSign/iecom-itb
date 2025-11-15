import React from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { MessageCircle, Phone, ExternalLink, HelpCircle } from "lucide-react";

export default function FAQPage() {
  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Help Center</h2>
          <p className="text-muted-foreground">
            Frequently asked questions and support contacts.
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-3">
        
        {/* --- LEFT COLUMN: FAQ ACCORDION --- */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>General Questions</CardTitle>
              <CardDescription>
                Common inquiries regarding registration and competition mechanics.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {/* PLACEHOLDER QUESTION 1 */}
                <AccordionItem value="item-1">
                  <AccordionTrigger>How do I create or join a team?</AccordionTrigger>
                  <AccordionContent>
                    You can create a team via the dashboard by entering a unique team name. 
                    Once created, you will receive a 5-letter Team Code. Share this code 
                    with your teammates so they can join your team using the &quot;Join Team&quot; tab.
                  </AccordionContent>
                </AccordionItem>

                {/* PLACEHOLDER QUESTION 2 */}
                <AccordionItem value="item-2">
                  <AccordionTrigger>What documents do I need to upload?</AccordionTrigger>
                  <AccordionContent>
                    Each member must upload a Student Card, Student Data/PDDIKTI screenshot, 
                    and a proof that you have followed @iecom2026. The team leader must also upload the payment proof 
                    once the team is fully formed (IECOM).
                  </AccordionContent>
                </AccordionItem>

                {/* PLACEHOLDER QUESTION 3 */}
                <AccordionItem value="item-3">
                  <AccordionTrigger>Why is my document verification status &quot;Waiting&quot;?</AccordionTrigger>
                  <AccordionContent>
                    Our admin team reviews documents manually. This process usually takes 24-48 hours. 
                    Please check back periodically. If rejected, you will see a reason in the notes section.
                  </AccordionContent>
                </AccordionItem>
                
                {/* PLACEHOLDER QUESTION 4 */}
                <AccordionItem value="item-4">
                  <AccordionTrigger>Can I change my team members after registration?</AccordionTrigger>
                  <AccordionContent>
                    Once the registration period closes or your team is verified, you generally cannot 
                    change members. For urgent changes, please contact the committee directly.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </div>

        {/* --- RIGHT COLUMN: CONTACT INFO --- */}
        <div className="space-y-6">
          
          {/* 1. SUBMIT QUESTION CARD */}
          <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-400">
                <HelpCircle className="h-5 w-5" />
                Have a specific question?
              </CardTitle>
              <CardDescription className="text-blue-600/80 dark:text-blue-300/80">
                If you can&apos;t find the answer here, you can submit your question directly to us.
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <Button asChild className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                <Link href="https://bit.ly/IECOM2026FAQ" target="_blank">
                  Ask via Form <ExternalLink className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>

          {/* 2. CONTACT PERSONS CARD */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Persons</CardTitle>
              <CardDescription>
                Reach out to us directly via LINE or WhatsApp.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
              
              {/* Contact: Samuel */}
              <div className="flex items-start space-x-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted">
                   <span className="font-semibold text-foreground">S</span>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">Samuel</p>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MessageCircle className="mr-2 h-3.5 w-3.5 text-green-600" />
                    <span>LINE: @samuellorenzols</span>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Phone className="mr-2 h-3.5 w-3.5 text-green-600" />
                    <Link href="https://wa.me/628120169196" className="hover:underline">
                      +62 812-0169-196
                    </Link>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Contact: Ilman */}
              <div className="flex items-start space-x-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted">
                   <span className="font-semibold text-foreground">I</span>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">Ilman</p>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MessageCircle className="mr-2 h-3.5 w-3.5 text-green-600" />
                    <span>LINE: @ilman1230</span>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Phone className="mr-2 h-3.5 w-3.5 text-green-600" />
                    <Link href="https://wa.me/6281220323245" className="hover:underline">
                      +62 812-2032-3245
                    </Link>
                  </div>
                </div>
              </div>

            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}