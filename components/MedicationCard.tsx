// components/MedicationCard.tsx

import { format } from 'date-fns';
import { Calendar, Clock, User, AlertCircle, Pill, Timer, Repeat } from 'lucide-react';
import { MedicalRecord } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { EditMedicationDialog } from './EditMedicationDialog';
import { capitalizeFirst } from '@/lib/utils';

interface MedicationCardProps {
  medication: MedicalRecord;
}

export function MedicationCard({ medication }: MedicationCardProps) {
  const startDate = format(new Date(medication.date), 'MMMM d, yyyy');
  const nextDueDate = medication.nextDueDate 
    ? format(new Date(medication.nextDueDate), 'MMMM d, yyyy')
    : null;

  const isOverdue = medication.nextDueDate 
    ? new Date(medication.nextDueDate) < new Date() 
    : false;

  const getDurationText = () => {
    const duration = (medication as any).duration;
    const unit = (medication as any).durationUnit;
    if (!duration || !unit) return null;
    
    const unitText = duration === 1 ? unit.slice(0, -1) : unit; // Remove 's' for singular
    return `${duration} ${unitText}`;
  };

  const durationText = getDurationText();

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div className="space-y-3">
            <div className="flex items-start gap-2 flex-wrap">
              <Badge>
                {capitalizeFirst(medication.type)}
              </Badge>
              {isOverdue && (
                <Badge variant="destructive">
                  Overdue
                </Badge>
              )}
              {(medication as any).reminder && (
                <Badge variant="outline">
                  Reminder On
                </Badge>
              )}
              {(medication as any).frequency && (medication as any).frequency !== 'once' && (
                <Badge variant="secondary">
                  {capitalizeFirst((medication as any).frequency)}
                </Badge>
              )}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">{medication.name}</h3>
                {(medication as any).dosage && (
                  <span className="text-sm text-muted-foreground">
                    ({(medication as any).dosage})
                  </span>
                )}
              </div>
              
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Started: {startDate}</span>
              </div>

              {nextDueDate && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>Next due: {nextDueDate}</span>
                </div>
              )}

              {durationText && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Timer className="h-4 w-4" />
                  <span>Duration: {durationText}</span>
                </div>
              )}

              {(medication as any).frequency && (medication as any).frequency !== 'once' && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Repeat className="h-4 w-4" />
                  <span>Repeats: {capitalizeFirst((medication as any).frequency)}</span>
                </div>
              )}

              {medication.prescribedBy && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <User className="h-4 w-4" />
                  <span>Prescribed by: {medication.prescribedBy}</span>
                </div>
              )}
            </div>

            {medication.notes && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-2 text-muted-foreground cursor-help">
                    <AlertCircle className="h-4 w-4" />
                    <span className="truncate max-w-[300px]">
                      {medication.notes}
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-[300px] whitespace-normal">
                    {medication.notes}
                  </p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>

          <div className="flex items-start gap-2">
            <EditMedicationDialog medication={medication}>
              <Button variant="outline" size="sm">
                Edit
              </Button>
            </EditMedicationDialog>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}