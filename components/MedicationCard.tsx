// components/MedicationCard.tsx
'use client';

import { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { 
  Pill, 
  Calendar, 
  Clock, 
  User, 
  AlertCircle, 
  Building2, 
  Repeat, 
  TimerOff, 
  RefreshCcw,
  Droplet,
  Package,
  Syringe,
  FileWarning,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { MedicalRecord } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { EditMedicationDialog } from './EditMedicationDialog';
import { capitalizeFirst } from '@/lib/utils';
import { 
  getStatusBadgeVariant, 
  getTypeBadgeVariant,
  routeLabels,
  scheduleLabels,
  statusLabels,
  typeLabels
} from '@/lib/schemas/medication';

interface MedicationCardProps {
  medication: MedicalRecord;
  isActive: boolean;
  showDetails?: boolean;
}

export function MedicationCard({ medication, isActive, showDetails = false }: MedicationCardProps) {
  const [isOpen, setIsOpen] = useState(showDetails);

  const formattedStartDate = format(parseISO(medication.date), 'PPP');
  const formattedNextDueDate = medication.nextDueDate 
    ? format(parseISO(medication.nextDueDate), 'PPP')
    : null;
  const formattedEndDate = medication.endDate 
    ? format(parseISO(medication.endDate), 'PPP')
    : null;
  const formattedCompletedDate = medication.completedDate 
    ? format(parseISO(medication.completedDate), 'PPP')
    : null;

  const getScheduleIcon = () => {
    switch (medication.schedule) {
      case 'once':
        return <TimerOff className="h-4 w-4" />;
      case 'as_needed':
        return <RefreshCcw className="h-4 w-4" />;
      default:
        return <Repeat className="h-4 w-4" />;
    }
  };

  const getRouteIcon = () => {
    switch (medication.administrationRoute) {
      case 'oral':
        return <Pill className="h-4 w-4" />;
      case 'injection':
        return <Syringe className="h-4 w-4" />;
      case 'topical':
      case 'drops':
        return <Droplet className="h-4 w-4" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col space-y-4">
          {/* Header Section */}
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant={getStatusBadgeVariant(medication.status)}>
                  {statusLabels[medication.status]}
                </Badge>
                <Badge variant={getTypeBadgeVariant(medication.type)}>
                  {typeLabels[medication.type]}
                </Badge>
                {medication.reminderEnabled && (
                  <Badge variant="secondary">
                    Reminders On
                  </Badge>
                )}
              </div>
              <h3 className="text-lg font-semibold">{medication.name}</h3>
              {medication.reason && (
                <p className="text-sm text-muted-foreground">{medication.reason}</p>
              )}
            </div>
            <EditMedicationDialog medication={medication}>
              <Button variant="outline" size="sm">Edit</Button>
            </EditMedicationDialog>
          </div>

          {/* Basic Info */}
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              Started: {formattedStartDate}
            </div>
            {formattedNextDueDate && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4" />
                Next: {formattedNextDueDate}
              </div>
            )}
            {medication.prescribedBy && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <User className="h-4 w-4" />
                Dr. {medication.prescribedBy}
              </div>
            )}
          </div>

          {/* Collapsible Details */}
          <Collapsible open={isOpen} onOpenChange={setIsOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="w-full justify-between">
                {isOpen ? 'Show Less' : 'Show More'}
                {isOpen ? 
                  <ChevronUp className="h-4 w-4 ml-2" /> : 
                  <ChevronDown className="h-4 w-4 ml-2" />
                }
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-4">
              {/* Schedule Information */}
              <div className="mt-4 grid gap-4">
                <div className="flex items-center gap-2">
                  {getScheduleIcon()}
                  <span className="font-medium">
                    {scheduleLabels[medication.schedule]}
                    {medication.scheduleDetails && ` - ${medication.scheduleDetails}`}
                  </span>
                </div>

                {/* Completion Information */}
                {(medication.status === 'completed' || medication.status === 'discontinued') && (
                  <div className="space-y-1 border-l-2 border-muted pl-4">
                    <p className="text-sm font-medium">
                      {medication.status === 'completed' ? 'Completed' : 'Discontinued'} on{' '}
                      {formattedCompletedDate}
                    </p>
                    {medication.completionNotes && (
                      <p className="text-sm text-muted-foreground">
                        {medication.completionNotes}
                      </p>
                    )}
                  </div>
                )}
                
                {/* Treatment Duration */}
                {medication.duration && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>{medication.duration}</span>
                  </div>
                )}

                {/* Dosing Information */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    {getRouteIcon()}
                    <span>{routeLabels[medication.administrationRoute]}</span>
                  </div>
                  {medication.dosage && (
                    <div className="text-sm text-muted-foreground">
                      Dosage: {medication.dosage}
                      {medication.dosageUnit && ` ${medication.dosageUnit}`}
                    </div>
                  )}
                  {medication.frequency && (
                    <div className="text-sm text-muted-foreground">
                      Frequency: {medication.frequency}
                    </div>
                  )}
                </div>

                {/* Prescription Details */}
                {(medication.pharmacy || medication.rxNumber || medication.refillsTotal > 0) && (
                  <div className="space-y-1">
                    <h4 className="font-medium flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      Prescription Details
                    </h4>
                    {medication.pharmacy && (
                      <div className="text-sm text-muted-foreground">
                        Pharmacy: {medication.pharmacy}
                      </div>
                    )}
                    {medication.rxNumber && (
                      <div className="text-sm text-muted-foreground">
                        RX#: {medication.rxNumber}
                      </div>
                    )}
                    {medication.refillsTotal > 0 && (
                      <div className="text-sm text-muted-foreground">
                        Refills: {medication.refillsRemaining}/{medication.refillsTotal}
                      </div>
                    )}
                  </div>
                )}

                {/* Side Effects & Notes */}
                {(medication.sideEffects || medication.notes) && (
                  <div className="space-y-1">
                    <h4 className="font-medium flex items-center gap-2">
                      <FileWarning className="h-4 w-4" />
                      Additional Information
                    </h4>
                    {medication.sideEffects && (
                      <div className="text-sm text-muted-foreground">
                        <span className="font-medium">Side Effects:</span> {medication.sideEffects}
                      </div>
                    )}
                    {medication.notes && (
                      <div className="text-sm text-muted-foreground">
                        <span className="font-medium">Notes:</span> {medication.notes}
                      </div>
                    )}
                  </div>
                )}

                {/* Reminder Settings */}
                {medication.reminderEnabled && medication.reminderTime && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>Daily reminder at {format(parseISO(`2000-01-01T${medication.reminderTime}`), 'h:mm a')}</span>
                  </div>
                )}
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </CardContent>
    </Card>
  );
}