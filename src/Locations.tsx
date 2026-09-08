import { APIProvider, Map, AdvancedMarker, Pin, InfoWindow, useAdvancedMarkerRef } from '@vis.gl/react-google-maps';
import React, { useState } from 'react';
import { LOCATIONS } from './data';
import { Location } from './types';
import SectionHeader from './components/SectionHeader';
import { MapPin, Phone, Clock, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';
import { useGsapReveal } from './hooks/useGsapReveal';

const API_KEY = process.env.GOOGLE_MAPS_PLATFORM_KEY || '';
const hasValidKey = Boolean(API_KEY) && API_KEY !== 'YOUR_API_KEY';

function LocationMarker({ location }: { location: Location }) {
  const [markerRef, marker] = useAdvancedMarkerRef();
  const [open, setOpen] = useState(false);

  return (
    <>
      <AdvancedMarker ref={markerRef} position={location.coords} onClick={() => setOpen(true)}>
        <Pin background="#F4A261" borderColor="#2D241E" glyphColor="#FFF" />
      </AdvancedMarker>
      {open && (
        <InfoWindow anchor={marker} onCloseClick={() => setOpen(false)}>
          <div className="p-2 max-w-[200px]">
            <h4 className="font-bold font-serif text-lg text-espresso mb-1">{location.name}</h4>
            <p className="text-xs text-espresso/60 mb-2">{location.address}, {location.city}</p>
            <p className="text-[10px] text-orange font-bold uppercase tracking-widest">{location.description}</p>
          </div>
        </InfoWindow>
      )}
    </>
  );
}

export default function Locations() {
  const [selectedLocation, setSelectedLocation] = useState(LOCATIONS[0]);
  useGsapReveal();

  const containerClasses = "relative pt-28 sm:pt-32 md:pt-36 pb-12 sm:pb-16 bg-[#FBF9F6] min-h-screen overflow-hidden font-sans";
  const bgClasses = "absolute inset-0 z-0 pointer-events-none";

  if (!hasValidKey) {
    return (
      <div className={containerClasses}>
        <div className={bgClasses} aria-hidden="true">
          <img 
            src="https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=2000" 
            alt="" 
            className="w-full h-full object-cover opacity-[0.06] mix-blend-multiply grayscale"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#FBF9F6]/80 via-transparent to-[#FBF9F6]/80" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <SectionHeader eyebrow="Locations" title="Our Training Centers." italicWord="Centers" id="locations-header" />
          <div className="grid md:grid-cols-3 gap-6 mt-12 gsap-reveal">
            {LOCATIONS.map((loc, idx) => (
              <div key={loc.id} className={`p-6 rounded-[2rem] border border-espresso/5 shadow-xl transition-all group ${idx === 0 ? 'bg-[#F9BC00] text-espresso' : idx === 1 ? 'bg-[#D62828] text-white' : 'bg-[#1A1A1A] text-white'}`}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform ${idx === 0 ? 'bg-espresso/10 text-espresso' : 'bg-white/10 text-white'}`}>
                  <MapPin className="w-5 h-5" />
                </div>
                <h4 className="text-xl font-serif mb-1.5">{loc.name}</h4>
                <p className="text-xs leading-relaxed mb-4 opacity-70">{loc.address}, {loc.city}</p>
                <div className="pt-4 border-t border-black/5 flex items-center justify-between">
                   <p className={`text-[9px] font-black uppercase tracking-[0.2em] opacity-80`}>{loc.description}</p>
                   <a 
                     href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(loc.name + ' ' + loc.address + ' ' + loc.city)}`}
                     target="_blank"
                     rel="noopener noreferrer"
                     className="text-[9px] font-black uppercase tracking-widest flex items-center gap-1 hover:underline shrink-0 ml-2"
                   >
                     Directions <ChevronRight className="w-3 h-3" />
                   </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={containerClasses}>
      <div className={bgClasses} aria-hidden="true">
        <img 
          src="https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=2000" 
          alt="" 
          className="w-full h-full object-cover opacity-[0.06] mix-blend-multiply grayscale"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#FBF9F6]/80 via-transparent to-[#FBF9F6]/80" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="gsap-reveal mb-10">
          <SectionHeader eyebrow="Our Facilities" title="Where we build athletes." italicWord="Where" id="locations-header" />
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mt-8 gsap-reveal">
          {/* List of Locations */}
          <div className="space-y-3">
            {LOCATIONS.map((loc, idx) => (
              <motion.button
                key={loc.id}
                whileHover={{ x: 4 }}
                onClick={() => setSelectedLocation(loc)}
                className={`w-full p-5 rounded-[1.5rem] border-2 text-left transition-all
                  ${selectedLocation.id === loc.id ? 'border-espresso bg-espresso text-white shadow-xl' : 'border-espresso/5 hover:border-[#D62828] bg-white shadow-sm text-espresso'}
                `}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center
                    ${selectedLocation.id === loc.id ? 'bg-[#F9BC00] text-espresso' : 'bg-espresso/5 text-espresso'}
                  `}>
                    <MapPin className="w-4 h-4" />
                  </div>
                  {selectedLocation.id === loc.id && <span className="text-[9px] font-black uppercase tracking-widest text-[#F9BC00]">Active Location</span>}
                </div>
                <h3 className="text-xl font-serif mb-1">{loc.name}</h3>
                <p className="text-xs opacity-60 mb-4">{loc.address}, {loc.city}</p>
                <div className={`space-y-2 pt-4 border-t ${selectedLocation.id === loc.id ? 'border-white/10' : 'border-espresso/5'}`}>
                  <div className="flex items-center gap-2 text-xs font-bold opacity-50">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Mon - Fri: 4:00 PM - 8:00 PM</span>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>

          {/* Map Container */}
          <div className="lg:col-span-2 relative h-[350px] sm:h-[450px] lg:h-auto min-h-[350px] lg:min-h-[500px] rounded-[1.5rem] sm:rounded-[2.5rem] overflow-hidden shadow-xl border-4 border-white bg-[#F9BC00] group">
            <APIProvider apiKey={API_KEY} version="weekly">
              <Map
                center={selectedLocation.coords}
                zoom={14}
                mapId="DEMO_MAP_ID"
                disableDefaultUI={true}
                zoomControl={true}
                internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
                style={{ width: '100%', height: '100%' }}
              >
                {LOCATIONS.map(loc => (
                  // @ts-ignore - key is used by React
                  <LocationMarker key={loc.id} location={loc} />
                ))}
              </Map>
            </APIProvider>
            
            {/* Overlay Info Card */}
            <div className="absolute bottom-4 right-4 left-4 sm:bottom-6 sm:right-6 sm:left-auto bg-[#1A1A1A] p-4 sm:p-5 rounded-[1.25rem] sm:rounded-[1.5rem] shadow-xl border border-white/10 max-w-xs text-white">
              <div className="text-[9px] font-black text-[#F9BC00] uppercase tracking-[0.3em] mb-1.5 sm:mb-2">Facility Details</div>
              <h4 className="font-serif text-base sm:text-lg mb-1.5 sm:mb-2">{selectedLocation.name}</h4>
              <p className="text-xs text-white/60 leading-relaxed mb-3 sm:mb-4">{selectedLocation.description}</p>
              <a 
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedLocation.name + ' ' + selectedLocation.address + ' ' + selectedLocation.city)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-[#D62828] text-white py-2.5 sm:py-3 rounded-xl font-bold uppercase tracking-widest text-[9px] hover:bg-white hover:text-espresso transition-all flex items-center justify-center gap-2"
              >
                Get Directions <ChevronRight className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
