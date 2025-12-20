
'use client';
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetClose
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";


interface ScheduleDraftSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  leagueName: string;
  onSave: (draftDate: Date) => void;
}

export function ScheduleDraftSheet({ open, onOpenChange, leagueName, onSave }: ScheduleDraftSheetProps) {
  const [draftType, setDraftType] = useState("snake");
  const [draftDate, setDraftDate] = useState<Date | undefined>(new Date());
  const [draftTime, setDraftTime] = useState("20:00");
  const [draftOrder, setDraftOrder] = useState("random");
  
  const handleSave = () => {
    if (draftDate) {
      const [hours, minutes] = draftTime.split(':').map(Number);
      const combinedDateTime = new Date(draftDate);
      combinedDateTime.setHours(hours, minutes);
      onSave(combinedDateTime);
    }
    onOpenChange(false);
  };
  
  // Generate time options (e.g., every 30 minutes)
  const timeOptions = Array.from({ length: 48 }, (_, i) => {
    const hours = Math.floor(i / 2);
    const minutes = (i % 2) * 30;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  });

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Draft Setting</SheetTitle>
          <SheetDescription>
            Schedule Your Draft for the <span className="font-semibold text-foreground">{leagueName}</span> league.
          </SheetDescription>
        </SheetHeader>
        <div className="py-6 grid gap-8">
            <div className="grid gap-3">
                <Label className="text-base font-semibold">DRAFT TYPE</Label>
                <RadioGroup value={draftType} onValueChange={setDraftType} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Label htmlFor="snake" className="cursor-pointer">
                        <RadioGroupItem value="snake" id="snake" className="sr-only" />
                        <Card className={cn("p-4", draftType === 'snake' && 'border-primary ring-2 ring-primary')}>
                            <div className="font-bold">Snake</div>
                            <p className="text-xs text-muted-foreground">Teams make picks and then order reverses.</p>
                        </Card>
                    </Label>
                     <Label htmlFor="salary-cap" className="cursor-pointer">
                        <RadioGroupItem value="salary-cap" id="salary-cap" className="sr-only" />
                        <Card className={cn("p-4", draftType === 'salary-cap' && 'border-primary ring-2 ring-primary')}>
                            <div className="font-bold">Salary Cap</div>
                            <p className="text-xs text-muted-foreground">Teams begin with a set budget and take turns nominating players.</p>
                        </Card>
                    </Label>
                     <Label htmlFor="autopick" className="cursor-pointer">
                        <RadioGroupItem value="autopick" id="autopick" className="sr-only" />
                        <Card className={cn("p-4", draftType === 'autopick' && 'border-primary ring-2 ring-primary')}>
                            <div className="font-bold">Autopick</div>
                            <p className="text-xs text-muted-foreground">Each team is selected automatically based on pre-draft rankings.</p>
                        </Card>
                    </Label>
                </RadioGroup>
            </div>

            <div className="grid gap-3">
                <Label className="text-base font-semibold">DRAFT DATE AND TIME</Label>
                <div className="grid grid-cols-2 gap-4">
                    <Popover>
                        <PopoverTrigger asChild>
                        <Button
                            variant={"outline"}
                            className={cn(
                            "justify-start text-left font-normal",
                            !draftDate && "text-muted-foreground"
                            )}
                        >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {draftDate ? format(draftDate, "PPP") : <span>Pick a date</span>}
                        </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                        <Calendar
                            mode="single"
                            selected={draftDate}
                            onSelect={setDraftDate}
                            initialFocus
                        />
                        </PopoverContent>
                    </Popover>
                    <Select value={draftTime} onValueChange={setDraftTime}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select time" />
                        </SelectTrigger>
                        <SelectContent>
                            {timeOptions.map(time => (
                                <SelectItem key={time} value={time}>
                                    {format(new Date(`1970-01-01T${time}`), 'h:mm a')}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="grid gap-3">
                <Label className="text-base font-semibold">DRAFT ORDER</Label>
                <RadioGroup value={draftOrder} onValueChange={setDraftOrder} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                     <Label htmlFor="random" className="cursor-pointer">
                        <RadioGroupItem value="random" id="random" className="sr-only" />
                        <Card className={cn("p-4", draftOrder === 'random' && 'border-primary ring-2 ring-primary')}>
                            <div className="font-bold">Random (recommended)</div>
                            <p className="text-xs text-muted-foreground">Enter the draft an hour before it begins to view the order.</p>
                        </Card>
                    </Label>
                     <Label htmlFor="manual" className="cursor-pointer">
                        <RadioGroupItem value="manual" id="manual" className="sr-only" />
                        <Card className={cn("p-4", draftOrder === 'manual' && 'border-primary ring-2 ring-primary')}>
                            <div className="font-bold">Manual</div>
                            <p className="text-xs text-muted-foreground">Customize your draft order.</p>
                        </Card>
                    </Label>
                </RadioGroup>
            </div>
        </div>
        <SheetFooter>
            <SheetClose asChild>
                <Button variant="outline">Cancel</Button>
            </SheetClose>
          <Button onClick={handleSave}>Save</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
