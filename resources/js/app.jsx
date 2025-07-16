import React, {
    useState,
    useEffect,
    useRef,
    useMemo,
    useCallback,
    Suspense,
} from "react";
import { createRoot } from "react-dom/client";
import { createPortal } from "react-dom";
import {
    Calendar,
    Plus,
    Search,
    Filter,
    MoreHorizontal,
    Clock,
    Origami,
    FlaskConical,
    Users,
    UserRoundCog,
    BarChart3,
    Shapes,
    Settings,
    Twitch,
    SmilePlus,
    UserPlus,
    Layers2,
    Handshake,
    Bell,
    Swords,
    SlidersHorizontal,
    Sticker,
    Cookie,
    ChevronDown,
    ChevronUp,
    Grid3X3,
    List,
    ChartSpline,
    Edit3,
    Eye,
    Trash2,
    Send,
    Minus,
    Save,
    X,
    Hash,
    Target,
    TrendingUp,
    TrendingDown,
    FileText,
    Image,
    Video,
    Mic,
    Calendar as CalendarIcon,
    CheckCircle2,
    AlertCircle,
    Circle,
    Zap,
    MoonStar, 
    Sparkles,
    Activity,
    ArrowRight,
    Briefcase,
    Globe,
    Heart,
    MessageSquare,
    Share2,
    ThumbsUp,
    Star,
    Command,
    LayoutGrid,
    PieChart,
    Folder,
    Tag,
    ArrowLeft,
    Layers,
    PlayCircle,
    Download,
    Upload,
    Copy,
    ExternalLink,
    ChevronLeft,
    ChevronRight,
    Menu,
    Maximize2,
    Minimize2,
    RefreshCw,
    Archive,
    BookOpen,
    Filter as FilterIcon,
    SortAsc,
    SortDesc,
    MoreVertical,
    Check,
    AlertTriangle,
    Info,
    HelpCircle,
    Keyboard,
    Palette,
    Monitor,
    Smartphone,
    Tablet,
    Package,
    MapPin,
    Phone, 
    User,
    Mail,
    DollarSign,
    Waypoints,
} from "lucide-react";

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("App Error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-b-darklight">
                    <div className="text-center p-8">
                        <AlertTriangle className="w-16 h-16 text-t-red mx-auto mb-4" />
                        <h1 className="text-2xl font-bold text-t-light mb-2">
                            Something went wrong
                        </h1>
                        <p className="text-t-light mb-6">
                            We're sorry for the inconvenience. Please refresh
                            the page.
                        </p>
                        <button
                            onClick={() => window.location.reload()}
                            className="px-6 py-3 bg-b-grn text-t-light rounded-lg hover:bg-b-grn transition-colors"
                        >
                            <RefreshCw className="w-4 h-4 inline mr-2" />
                            Refresh Page
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

// Loading Component
const LoadingSpinner = ({ size = "md", className = "" }) => {
    const sizeClasses = {
        sm: "w-4 h-4",
        md: "w-6 h-6",
        lg: "w-8 h-8",
    };

    return (
        <div
            className={`animate-spin rounded-full border-2 border-borlight border-t-bor-grn ${sizeClasses[size]} ${className}`}
        />
    );
};

// Toast Notification System
const useToast = () => {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((message, type = "info", duration = 5000) => {
        const id = Date.now();
        const toast = { id, message, type, duration };

        setToasts((prev) => [...prev, toast]);

        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, duration);
    }, []);

    const removeToast = useCallback((id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    return { toasts, addToast, removeToast };
};

// Custom Hooks
const useLocalStorage = (key, initialValue) => {
    const [storedValue, setStoredValue] = useState(() => {
        try {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            console.warn(`Error reading localStorage key "${key}":`, error);
            return initialValue;
        }
    });

    const setValue = useCallback(
        (value) => {
            try {
                const valueToStore =
                    value instanceof Function ? value(storedValue) : value;
                setStoredValue(valueToStore);
                window.localStorage.setItem(key, JSON.stringify(valueToStore));
            } catch (error) {
                console.warn(`Error setting localStorage key "${key}":`, error);
            }
        },
        [key, storedValue]
    );

    return [storedValue, setValue];
};

const useDebounce = (value, delay) => {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => clearTimeout(handler);
    }, [value, delay]);

    return debouncedValue;
};

const useKeyboardShortcuts = (shortcuts) => {
    useEffect(() => {
        const handleKeyPress = (event) => {
            const { ctrlKey, metaKey, key, altKey, shiftKey } = event;
            const isModifierPressed = ctrlKey || metaKey;

            Object.entries(shortcuts).forEach(([shortcut, handler]) => {
                // Handle shortcuts without modifiers (like "escape")
                if (!shortcut.includes("+")) {
                    if (key.toLowerCase() === shortcut.toLowerCase()) {
                        event.preventDefault();
                        handler();
                    }
                    return;
                }

                // Handle shortcuts with modifiers
                const [modifiers, targetKey] = shortcut.split("+");
                
                // Safety check
                if (!targetKey) return;
                
                const hasCtrl =
                    modifiers.includes("ctrl") || modifiers.includes("cmd");
                const hasAlt = modifiers.includes("alt");
                const hasShift = modifiers.includes("shift");

                if (
                    key.toLowerCase() === targetKey.toLowerCase() &&
                    hasCtrl === isModifierPressed &&
                    hasAlt === altKey &&
                    hasShift === shiftKey
                ) {
                    event.preventDefault();
                    handler();
                }
            });
        };

        document.addEventListener("keydown", handleKeyPress);
        return () => document.removeEventListener("keydown", handleKeyPress);
    }, [shortcuts]);
};

// Toast Container Component
const ToastContainer = ({ toasts, removeToast }) => (
    <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map((toast) => {
            const bgColor = {
                success: "bg-b-grn",
                error: "bg-b-red",
                warning: "bg-b-darklight",
                info: "bg-b-blue",
            }[toast.type];

            const Icon = {
                success: CheckCircle2,
                error: AlertTriangle,
                warning: AlertCircle,
                info: Info,
            }[toast.type];

            return (
                <div
                    key={toast.id}
                    className={`${bgColor} text-t-light px-6 py-4 rounded-lg shadow-lg transform transition-all duration-300 max-w-sm animate-slide-up`}
                >
                    <div className="flex items-center space-x-3">
                        <Icon className="w-5 h-5" />
                        <span className="font-medium">{toast.message}</span>
                        <button
                            onClick={() => removeToast(toast.id)}
                            className="ml-auto rounded p-1 transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            );
        })}
    </div>
);

// Input Component
const Input = ({
    leftIcon: LeftIcon,
    rightIcon: RightIcon,
    error,
    label,
    className = "",
    containerClassName = "",
    value, // ← TAMBAH value prop handling
    ...props
}) => (
    <div className={containerClassName}>
        {label && (
            <label className="block text-sm font-semibold text-t-mut mb-1">
                {label}
            </label>
        )}
        <div className="relative">
            {LeftIcon && (
                <LeftIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-yellow-500 w-6 h-6" />
            )}
            <input
                className={`w-full px-4 py-3 bg-b-closedark text-base text-t-light ${
                    LeftIcon ? "pl-12" : ""
                } ${
                    RightIcon ? "pr-12" : ""
                } rounded-2xl focus:ring-2 focus:border-transparent transition-all duration-200 ${
                    error ? "border-red-500 focus:ring-red-500" : ""
                } ${className}`}
                value={value || ""} // ← FIX: Always use string
                {...props}
            />
            {RightIcon && (
                <RightIcon className="absolute right-4 top-1/2 transform -translate-y-1/2 text-t-light w-6 h-6" />
            )}
        </div>
        {error && (
            <p className="mt-2 text-sm text-t-red flex items-center">
                <AlertTriangle className="w-4 h-4 mr-1" />
                {error}
            </p>
        )}
    </div>
);

// Custom DatePicker Component
const DatePicker = ({ value, onChange, placeholder = "Date", error, label, className = "" }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [currentDate, setCurrentDate] = useState(value ? new Date(value) : new Date());
    const [selectedDate, setSelectedDate] = useState(value ? new Date(value) : null);
    const [viewMode, setViewMode] = useState('day'); // 'day', 'month', 'year'
    const dropdownRef = useRef(null);
    const portalRef = useRef(null);

    const today = new Date();
    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            // ← UBAH LOGIC INI
            const isClickInTrigger = dropdownRef.current && dropdownRef.current.contains(event.target);
            const isClickInPortal = portalRef.current && portalRef.current.contains(event.target);
            
            if (!isClickInTrigger && !isClickInPortal) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const getDaysInMonth = (date) => {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (date) => {
        return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    };

    const isToday = (date) => {
        return date.toDateString() === today.toDateString();
    };

    const isSameDate = (date1, date2) => {
        return date1 && date2 && date1.toDateString() === date2.toDateString();
    };

    const handleDateSelect = (date) => {
        setSelectedDate(date);
        // Format manual tanpa timezone conversion
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const formattedDate = `${year}-${month}-${day}`;
        
        onChange(formattedDate);
        setIsOpen(false);
    };

    const navigateMonth = (direction) => {
        const newDate = new Date(currentDate);
        newDate.setMonth(newDate.getMonth() + direction);
        setCurrentDate(newDate);
    };

    const navigateYear = (direction) => {
        const newDate = new Date(currentDate);
        newDate.setFullYear(newDate.getFullYear() + direction);
        setCurrentDate(newDate);
    };

    const renderDayView = () => {
        const daysInMonth = getDaysInMonth(currentDate);
        const firstDay = getFirstDayOfMonth(currentDate);
        const dates = [];

        // Empty cells for previous month
        for (let i = 0; i < firstDay; i++) {
            dates.push(null);
        }

        // Days of current month
        for (let i = 1; i <= daysInMonth; i++) {
            dates.push(new Date(currentDate.getFullYear(), currentDate.getMonth(), i));
        }

        return (
            <div className="p-4">
                {/* Header */}
                <div className="flex items-center justify-between mb-2">
                    <button
                        type="button"
                        onClick={() => navigateMonth(-1)}
                        className="p-2 hover:bg-b-darklight rounded-lg transition-colors"
                    >
                        <ChevronLeft className="w-4 h-4 text-t-light" />
                    </button>

                    <button
                        onClick={() => setViewMode('month')}
                        className="text-sm font-semibold text-t-light hover:text-t-blue transition-colors"
                    >
                        {months[currentDate.getMonth()]} {currentDate.getFullYear()}
                    </button>

                    <button
                        type="button"
                        onClick={() => navigateMonth(1)}
                        className="p-2 hover:bg-b-darklight rounded-lg transition-colors"
                    >
                        <ChevronRight className="w-4 h-4 text-t-light" />
                    </button>
                </div>

                {/* Days header */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                    {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
                        <div key={day} className="p-2 text-center text-xs font-medium text-t-mut">
                            {day}
                        </div>
                    ))}
                </div>

                {/* Dates grid */}
                <div className="grid grid-cols-7 gap-1">
                    {dates.map((date, index) => (
                        <button
                            key={index}
                            onClick={() => date && handleDateSelect(date)}
                            disabled={!date}
                            className={`px-0 py-2 text-base rounded-full transition-colors ${
                                !date 
                                    ? 'cursor-default' 
                                    : isSameDate(date, selectedDate)
                                    ? 'bg-b-acc font-bold text-t-acc'
                                    : isToday(date)
                                    ? 'text-t-light font-bold !text-2xl'
                                    : 'text-t-light hover:bg-b-acc'
                            }`}
                        >
                            {date && date.getDate()}
                        </button>
                    ))}
                </div>

                {/* Quick actions */}
                <div className="mt-4 pt-4 border-t border-bor flex space-x-2">
                    <button
                        type="button"
                        onClick={() => {
                            const year = today.getFullYear();
                            const month = String(today.getMonth() + 1).padStart(2, '0');
                            const day = String(today.getDate()).padStart(2, '0');
                            const formattedDate = `${year}-${month}-${day}`;
                            setSelectedDate(today);
                            onChange(formattedDate);
                            setIsOpen(false);
                        }}
                        className="px-3 py-1 text-base bg-b-darklight hover:bg-b-semidark text-t-mut rounded-lg transition-colors"
                    >
                        Today
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            const tomorrow = new Date(today);
                            tomorrow.setDate(tomorrow.getDate() + 1);
                            const year = tomorrow.getFullYear();
                            const month = String(tomorrow.getMonth() + 1).padStart(2, '0');
                            const day = String(tomorrow.getDate()).padStart(2, '0');
                            const formattedDate = `${year}-${month}-${day}`;
                            setSelectedDate(tomorrow);
                            onChange(formattedDate);
                            setIsOpen(false);
                        }}
                        className="px-3 py-1 text-base bg-b-darklight hover:bg-b-semidark text-t-mut rounded-lg transition-colors"
                    >
                        Tomorrow
                    </button>
                </div>
            </div>
        );
    };

    const renderMonthView = () => {
        return (
            <div className="p-4">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <button
                        type="button"
                        onClick={() => navigateYear(-1)}
                        className="p-2 hover:bg-b-darklight rounded-lg transition-colors"
                    >
                        <ChevronLeft className="w-4 h-4 text-t-light" />
                    </button>

                    <button
                        onClick={() => setViewMode('year')}
                        className="text-sm font-semibold text-t-light hover:text-t-blue transition-colors"
                    >
                        {currentDate.getFullYear()}
                    </button>

                    <button
                        type="button"
                        onClick={() => navigateYear(1)}
                        className="p-2 hover:bg-b-darklight rounded-lg transition-colors"
                    >
                        <ChevronRight className="w-4 h-4 text-t-light" />
                    </button>
                </div>

                {/* Months grid */}
                <div className="grid grid-cols-3 gap-2">
                    {months.map((month, index) => (
                        <button
                            key={month}
                            type="button"
                            onClick={() => {
                                const newDate = new Date(currentDate);
                                newDate.setMonth(index);
                                setCurrentDate(newDate);
                                setViewMode('day');
                            }}
                            className={`p-3 text-sm rounded-lg transition-colors ${
                                index === currentDate.getMonth()
                                    ? 'bg-b-blue text-t-light'
                                    : 'text-t-light hover:bg-b-darklight'
                            }`}
                        >
                            {month.slice(0, 3)}
                        </button>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div className={className}>
            {label && (
                <label className="block text-sm font-medium text-t-mut mb-1 relative">
                    {label}
                </label>
            )}
            <div ref={dropdownRef}>
                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className={`w-full px-4 py-3 text-left text-base bg-b-darklight text-t-light rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 flex items-center justify-between ${
                        error ? 'border-red-500' : ''
                    }`}
                >
                    <span className={selectedDate ? 'text-t-light' : 'text-t-mut'}>
                        {selectedDate 
                            ? selectedDate.toLocaleDateString('en-US', { 
                                year: 'numeric', 
                                month: 'short', 
                                day: 'numeric' 
                            })
                            : placeholder
                        }
                    </span>
                    <CalendarIcon className="w-5 h-5 text-t-mut" />
                </button>

                {isOpen && createPortal(
                    (() => {
                        if (!dropdownRef.current) return null;
                        
                        const rect = dropdownRef.current.getBoundingClientRect();
                        const spaceBelow = window.innerHeight - rect.bottom;
                        const spaceAbove = rect.top;
                        const pickerHeight = 350;
                        
                        // Panel detection logic
                        const isInPanel = dropdownRef.current.closest('[data-panel="true"]') !== null;
                        
                        if (isInPanel) {
                            // Panel mode: Center dan lebar penuh panel
                            const panel = dropdownRef.current.closest('[data-panel="true"]');
                            const panelRect = panel.getBoundingClientRect();
                            const openUpward = spaceAbove > spaceBelow && spaceBelow < pickerHeight;
                            
                            return (
                                <div 
                                    ref={portalRef}
                                    className="bg-b-semidark border border-bor rounded-2xl shadow-xl"
                                    style={{
                                        position: 'fixed',
                                        left: `${panelRect.left + 24}px`,
                                        right: `${window.innerWidth - panelRect.right + 24}px`,
                                        top: openUpward 
                                            ? `${rect.top - 8}px`
                                            : `${rect.bottom + 8}px`,
                                        transform: openUpward ? 'translateY(-100%)' : 'none',
                                        zIndex: 99999,
                                        width: 'auto'
                                    }}
                                >
                                    {viewMode === 'day' && renderDayView()}
                                    {viewMode === 'month' && renderMonthView()}
                                </div>
                            );
                        } else {
                            // Normal mode: Original positioning
                            const openUpward = spaceAbove > spaceBelow && spaceBelow < pickerHeight;
                            
                            return (
                                <div 
                                    ref={portalRef}
                                    className="bg-b-semidark border border-bor rounded-2xl shadow-xl"
                                    style={{
                                        position: 'fixed',
                                        left: `${Math.max(8, Math.min(window.innerWidth - 320, rect.left))}px`,
                                        top: openUpward 
                                            ? `${rect.top - 8}px`
                                            : `${rect.bottom + 8}px`,
                                        transform: openUpward ? 'translateY(-100%)' : 'none',
                                        zIndex: 99999,
                                        width: '300px'
                                    }}
                                >
                                    {viewMode === 'day' && renderDayView()}
                                    {viewMode === 'month' && renderMonthView()}
                                </div>
                            );
                        }
                    })(),
                    document.body
                )}
            </div>

            {error && (
                <p className="mt-2 text-sm text-t-red flex items-center">
                    <AlertTriangle className="w-4 h-4 mr-1" />
                    {error}
                </p>
            )}
        </div>
    );
};

// Custom TimePicker Component
const TimePicker = ({ value, onChange, placeholder = "Time", error, label, className = "" }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedTime, setSelectedTime] = useState(value || ''); // ← FIX
    const [hours, setHours] = useState(() => {
        if (!value) return 9;
        const hourValue = parseInt(value.split(':')[0]);
        return hourValue > 12 ? hourValue - 12 : (hourValue === 0 ? 12 : hourValue);
    });
    const [minutes, setMinutes] = useState(value ? parseInt(value.split(':')[1]) : 0);
    const [period, setPeriod] = useState(() => {
        if (!value) return 'AM';
        const hourValue = parseInt(value.split(':')[0]);
        return hourValue >= 12 ? 'PM' : 'AM';
    });
    const dropdownRef = useRef(null);
    const portalRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            const isClickInTrigger = dropdownRef.current && dropdownRef.current.contains(event.target);
            const isClickInPortal = portalRef.current && portalRef.current.contains(event.target);
            
            if (!isClickInTrigger && !isClickInPortal) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (value && value !== selectedTime) {
            setSelectedTime(value);
            const hourValue = parseInt(value.split(':')[0]);
            setHours(hourValue > 12 ? hourValue - 12 : (hourValue === 0 ? 12 : hourValue));
            setMinutes(parseInt(value.split(':')[1]));
            setPeriod(hourValue >= 12 ? 'PM' : 'AM');
        }
    }, [value]);

    const formatTime = (h, m, p) => {
        const hour24 = p === 'PM' && h !== 12 ? h + 12 : p === 'AM' && h === 12 ? 0 : h;
        return `${hour24.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
    };

    const handleTimeChange = (newHours, newMinutes, newPeriod) => {
        setHours(newHours);
        setMinutes(newMinutes);
        setPeriod(newPeriod);
        
        const timeString = formatTime(newHours, newMinutes, newPeriod);
        setSelectedTime(timeString);
        onChange(timeString);
    };

    const quickTimes = [
        { label: 'Morning', time: '09:00', hours: 9, minutes: 0, period: 'AM' },
        { label: 'Lunch', time: '12:00', hours: 12, minutes: 0, period: 'PM' },
        { label: 'Afternoon', time: '14:00', hours: 2, minutes: 0, period: 'PM' },
        { label: 'Evening', time: '17:00', hours: 5, minutes: 0, period: 'PM' }
    ];

    return (
        <div className={className}>
            {label && (
                <label className="block text-sm font-medium text-t-mut mb-1">
                    {label}
                </label>
            )}
            <div ref={dropdownRef}>
                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className={`w-full px-4 py-3 text-left text-base bg-b-darklight text-t-light rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 flex items-center justify-between ${
                        error ? 'border-red-500' : ''
                    }`}
                >
                    <span className={selectedTime ? 'text-t-light' : 'text-t-mut'}>
                        {selectedTime 
                            ? new Date(`2000-01-01T${selectedTime}`).toLocaleTimeString('en-US', { 
                                hour: 'numeric', 
                                minute: '2-digit',
                                hour12: true 
                            })
                            : placeholder
                        }
                    </span>
                    <Clock className="w-5 h-5 text-t-mut" />
                </button>
                {isOpen && createPortal(
                    (() => {
                        if (!dropdownRef.current) return null;
                        
                        const rect = dropdownRef.current.getBoundingClientRect();
                        const spaceBelow = window.innerHeight - rect.bottom;
                        const spaceAbove = rect.top;
                        const pickerHeight = 300;
                        
                        // Panel detection logic
                        const isInPanel = dropdownRef.current.closest('[data-panel="true"]') !== null;
                        
                        if (isInPanel) {
                            // Panel mode: Center dan lebar penuh panel
                            const panel = dropdownRef.current.closest('[data-panel="true"]');
                            const panelRect = panel.getBoundingClientRect();
                            const openUpward = spaceAbove > spaceBelow && spaceBelow < pickerHeight;
                            
                            return (
                                <div 
                                    ref={portalRef}
                                    className="bg-b-semidark border border-bor rounded-2xl shadow-xl"
                                    style={{
                                        position: 'fixed',
                                        left: `${panelRect.left + 24}px`,
                                        right: `${window.innerWidth - panelRect.right + 24}px`,
                                        top: openUpward 
                                            ? `${rect.top - 8}px`
                                            : `${rect.bottom + 8}px`,
                                        transform: openUpward ? 'translateY(-100%)' : 'none',
                                        zIndex: 99999,
                                        width: 'auto'
                                    }}
                                >
                                    <div className="p-4">
                                        {/* Time wheels */}
                                        <div className="flex items-center justify-center space-x-4 mb-4">
                                            <div className="flex items-center gap-5">
                                                <div className="flex items-center gap-2">
                                                    {/* Hours */}
                                                    <div className="text-center">
                                                        <div className="flex flex-col space-y-1 items-center">
                                                            <button
                                                                type="button"
                                                                onClick={() => handleTimeChange(hours === 12 ? 1 : hours + 1, minutes, period)}
                                                                className="p-1 hover:bg-b-darklight rounded"
                                                            >
                                                                <ChevronUp className="w-4 h-4 text-t-mut" />
                                                            </button>
                                                            <div className="w-12 h-12 bg-b-darklight rounded-lg flex items-center justify-center">
                                                                <span className="text-lg font-bold text-t-light">{hours}</span>
                                                            </div>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleTimeChange(hours === 1 ? 12 : hours - 1, minutes, period)}
                                                                className="p-1 hover:bg-b-darklight rounded"
                                                            >
                                                                <ChevronDown className="w-4 h-4 text-t-mut" />
                                                            </button>
                                                        </div>
                                                    </div>

                                                    <div className="text-2xl font-bold text-t-mut">:</div>

                                                    {/* Minutes */}
                                                    <div className="text-center">
                                                        <div className="flex flex-col items-center space-y-1">
                                                            <button
                                                                type="button"
                                                                onClick={() => handleTimeChange(hours, minutes === 45 ? 0 : minutes + 15, period)}
                                                                className="p-1 hover:bg-b-darklight rounded"
                                                            >
                                                                <ChevronUp className="w-4 h-4 text-t-mut" />
                                                            </button>
                                                            <div className="w-12 h-12 bg-b-darklight rounded-lg flex items-center justify-center">
                                                                <span className="text-lg font-bold text-t-light">{minutes.toString().padStart(2, '0')}</span>
                                                            </div>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleTimeChange(hours, minutes === 0 ? 45 : minutes - 15, period)}
                                                                className="p-1 hover:bg-b-darklight rounded"
                                                            >
                                                                <ChevronDown className="w-4 h-4 text-t-mut" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* AM/PM dengan tombol SET */}
                                                <div className="text-center">
                                                    <div className="flex flex-col space-y-1">
                                                        <div className="flex items-center space-x-2">
                                                            {/* AM/PM Toggle */}
                                                            <div className="bg-b-darklight rounded-lg flex">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleTimeChange(hours, minutes, 'AM')}
                                                                    className={`w-12 h-12 flex-1 rounded-l-lg transition-colors ${
                                                                        period === 'AM' ? 'bg-b-acc text-t-light' : 'text-t-light hover:bg-b-acc-hov'
                                                                    }`}
                                                                >
                                                                    AM
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleTimeChange(hours, minutes, 'PM')}
                                                                    className={`w-12 h-12 flex-1 rounded-r-lg transition-colors ${
                                                                        period === 'PM' ? 'bg-b-acc text-t-light' : 'text-t-light hover:bg-b-acc-hov'
                                                                    }`}
                                                                >
                                                                    PM
                                                                </button>
                                                            </div>
                                                            
                                                            {/* SET Button */}
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    const timeString = formatTime(hours, minutes, period);
                                                                    setSelectedTime(timeString);
                                                                    onChange(timeString);
                                                                    setIsOpen(false);
                                                                }}
                                                                className="w-12 h-12 bg-b-darklight hover:bg-b-grn text-t-light rounded-lg transition-colors font-medium text-sm"
                                                                title="Set Time"
                                                            >
                                                                SET
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Quick time selections */}
                                        <div className="border-t border-bor pt-4">
                                            <div className="grid grid-cols-2 gap-2">
                                                {quickTimes.map((quick) => (
                                                    <button
                                                        key={quick.label}
                                                        onClick={() => {
                                                            handleTimeChange(quick.hours, quick.minutes, quick.period);
                                                            setIsOpen(false);
                                                        }}
                                                        className="px-3 py-2 text-sm bg-b-darklight hover:bg-b-acc text-t-light rounded-lg transition-colors text-center"
                                                    >
                                                        <div className="font-medium">{quick.label}</div>
                                                        <div className="text-t-mut">{quick.time}</div>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        } else {
                            // Normal mode: Original positioning
                            const openUpward = spaceAbove > spaceBelow && spaceBelow < pickerHeight;
                            
                            return (
                                <div 
                                    ref={portalRef}
                                    className="bg-b-semidark border border-bor rounded-2xl shadow-xl"
                                    style={{
                                        position: 'fixed',
                                        left: `${Math.max(8, Math.min(window.innerWidth - 280, rect.left))}px`,
                                        top: openUpward 
                                            ? `${rect.top - 8}px`
                                            : `${rect.bottom + 8}px`,
                                        transform: openUpward ? 'translateY(-100%)' : 'none',
                                        zIndex: 99999,
                                        width: '260px'
                                    }}
                                >
                                    <div className="p-4">
                                        {/* Time wheels */}
                                        <div className="flex items-center justify-center space-x-4 mb-4">
                                            <div className="flex items-center gap-5">
                                                <div className="flex items-center gap-2">
                                                    {/* Hours */}
                                                    <div className="text-center">
                                                        <div className="flex flex-col space-y-1 items-center">
                                                            <button
                                                                type="button"
                                                                onClick={() => handleTimeChange(hours === 12 ? 1 : hours + 1, minutes, period)}
                                                                className="p-1 hover:bg-b-darklight rounded"
                                                            >
                                                                <ChevronUp className="w-4 h-4 text-t-mut" />
                                                            </button>
                                                            <div className="w-12 h-12 bg-b-darklight rounded-lg flex items-center justify-center">
                                                                <span className="text-lg font-bold text-t-light">{hours}</span>
                                                            </div>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleTimeChange(hours === 1 ? 12 : hours - 1, minutes, period)}
                                                                className="p-1 hover:bg-b-darklight rounded"
                                                            >
                                                                <ChevronDown className="w-4 h-4 text-t-mut" />
                                                            </button>
                                                        </div>
                                                    </div>

                                                    <div className="text-2xl font-bold text-t-mut">:</div>

                                                    {/* Minutes */}
                                                    <div className="text-center">
                                                        <div className="flex flex-col items-center space-y-1">
                                                            <button
                                                                type="button"
                                                                onClick={() => handleTimeChange(hours, minutes === 45 ? 0 : minutes + 15, period)}
                                                                className="p-1 hover:bg-b-darklight rounded"
                                                            >
                                                                <ChevronUp className="w-4 h-4 text-t-mut" />
                                                            </button>
                                                            <div className="w-12 h-12 bg-b-darklight rounded-lg flex items-center justify-center">
                                                                <span className="text-lg font-bold text-t-light">{minutes.toString().padStart(2, '0')}</span>
                                                            </div>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleTimeChange(hours, minutes === 0 ? 45 : minutes - 15, period)}
                                                                className="p-1 hover:bg-b-darklight rounded"
                                                            >
                                                                <ChevronDown className="w-4 h-4 text-t-mut" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* AM/PM dengan tombol SET */}
                                                <div className="text-center">
                                                    <div className="flex flex-col space-y-1">
                                                        <div className="flex items-center space-x-2">
                                                            {/* AM/PM Toggle */}
                                                            <div className="bg-b-darklight rounded-lg flex">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleTimeChange(hours, minutes, 'AM')}
                                                                    className={`w-12 h-12 flex-1 rounded-l-lg transition-colors ${
                                                                        period === 'AM' ? 'bg-b-acc text-t-light' : 'text-t-light hover:bg-b-acc-hov'
                                                                    }`}
                                                                >
                                                                    AM
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleTimeChange(hours, minutes, 'PM')}
                                                                    className={`w-12 h-12 flex-1 rounded-r-lg transition-colors ${
                                                                        period === 'PM' ? 'bg-b-acc text-t-light' : 'text-t-light hover:bg-b-acc-hov'
                                                                    }`}
                                                                >
                                                                    PM
                                                                </button>
                                                            </div>
                                                            
                                                            {/* SET Button */}
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    const timeString = formatTime(hours, minutes, period);
                                                                    setSelectedTime(timeString);
                                                                    onChange(timeString);
                                                                    setIsOpen(false);
                                                                }}
                                                                className="w-12 h-12 bg-b-darklight hover:bg-b-grn text-t-light rounded-lg transition-colors font-medium text-sm"
                                                                title="Set Time"
                                                            >
                                                                SET
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Quick time selections */}
                                        <div className="border-t border-bor pt-4">
                                            <div className="grid grid-cols-2 gap-2">
                                                {quickTimes.map((quick) => (
                                                    <button
                                                        key={quick.label}
                                                        onClick={() => {
                                                            handleTimeChange(quick.hours, quick.minutes, quick.period);
                                                            setIsOpen(false);
                                                        }}
                                                        className="px-3 py-2 text-sm bg-b-darklight hover:bg-b-acc text-t-light rounded-lg transition-colors text-center"
                                                    >
                                                        <div className="font-medium">{quick.label}</div>
                                                        <div className="text-t-mut">{quick.time}</div>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        }
                    })(),
                    document.body
                )}
            </div>

            {error && (
                <p className="mt-2 text-sm text-t-red flex items-center">
                    <AlertTriangle className="w-4 h-4 mr-1" />
                    {error}
                </p>
            )}
        </div>
    );
};

// Combined DateTimePicker Component
const DateTimePicker = ({ value, onChange, placeholder = "Select date and time...", error, label, className = "" }) => {
    const [dateValue, setDateValue] = useState(() => {
        if (!value) return '';
        if (value.includes('T')) {
            return value.split('T')[0];
        }
        if (value.includes(' ')) {
            const parts = value.split(' ');
            return parts[0];
        }
        return value || ''; // ← FIX: ensure string
    });

    const [timeValue, setTimeValue] = useState(() => {
        if (!value) return '';
        if (value.includes('T')) {
            return value.split('T')[1]?.slice(0, 5) || '';
        }
        if (value.includes(' ')) {
            const timePart = value.split(' ')[1];
            return timePart ? timePart.slice(0, 5) : '';
        }
        return '';
    });

    useEffect(() => {
        if (value) {
            let newDateValue = '';
            let newTimeValue = '';
            
            if (value.includes('T')) {
                [newDateValue, newTimeValue] = value.split('T');
                newTimeValue = newTimeValue?.slice(0, 5) || '';
            } else if (value.includes(' ')) {
                const parts = value.split(' ');
                newDateValue = parts[0];
                newTimeValue = parts[1] ? parts[1].slice(0, 5) : '';
            } else {
                newDateValue = value;
            }
            
            setDateValue(newDateValue);
            setTimeValue(newTimeValue);
        }
    }, [value]);

    const handleDateChange = (newDate) => {
        setDateValue(newDate);
        if (newDate && timeValue) {
            onChange(`${newDate}T${timeValue}`);
        } else if (newDate) {
            onChange(`${newDate}T09:00`);
        }
    };

    const handleTimeChange = (newTime) => {
        setTimeValue(newTime);
        if (dateValue && newTime) {
            onChange(`${dateValue}T${newTime}`);
        }
    };
    

    return (
        <div className={className}>
            {label && (
                <label className="block text-sm font-medium text-t-mut mb-1">
                    {label}
                </label>
            )}
            <div className="grid grid-cols-2 gap-3 relative">
                <DatePicker
                    value={dateValue}
                    onChange={handleDateChange}
                    placeholder="Date"
                />
                <TimePicker
                    value={timeValue}
                    onChange={handleTimeChange}
                    placeholder="Time"
                />
            </div>
            {error && (
                <p className="mt-2 text-sm text-t-red flex items-center">
                    <AlertTriangle className="w-4 h-4 mr-1" />
                    {error}
                </p>
            )}
        </div>
    );
};

// Modal Component
const Modal = ({ isOpen, onClose, title, children, size = "md" }) => {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }

        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isOpen]);

    if (!isOpen) return null;

    const sizes = {
        sm: "max-w-md",
        md: "max-w-2xl",
        lg: "max-w-4xl",
        xl: "max-w-6xl",
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-screen items-center justify-center p-4">
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                    onClick={onClose}
                />
                <div className={`relative bg-b-semidark rounded-2xl shadow-2xl w-full ${sizes[size]} transform transition-all duration-300 scale-100`} 
                    data-panel="true">
                    <div className="flex items-center justify-between p-6 border-b border-borlight">
                        <h2 className="text-xl font-semibold text-t-light">
                            {title}
                        </h2>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-b-darklight rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5 text-t-mut" />
                        </button>
                    </div>
                    <div className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
};

// Custom Confirmation Modal Component
const ConfirmationModal = ({ 
    isOpen, 
    onClose, 
    onConfirm, 
    title = "Confirm Action",
    message = "Are you sure you want to proceed?",
    confirmText = "Confirm",
    cancelText = "Cancel",
    type = "danger" // danger, warning, info
}) => {
    if (!isOpen) return null;

    const typeStyles = {
        danger: {
            bg: "bg-red-500/10",
            border: "border-red-500/30",
            icon: "text-t-red",
            button: "bg-b-red hover:bg-red-600"
        },
        warning: {
            bg: "bg-yellow-500/10", 
            border: "border-yellow-500/30",
            icon: "text-yellow-400",
            button: "bg-yellow-600 hover:bg-yellow-700"
        },
        info: {
            bg: "bg-blue-500/10",
            border: "border-blue-500/30", 
            icon: "text-blue-400",
            button: "bg-blue-600 hover:bg-blue-700"
        }
    };

    const style = typeStyles[type];
    const IconComponent = type === 'danger' ? AlertTriangle : type === 'warning' ? AlertCircle : Info;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-screen items-center justify-center p-4">
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                    onClick={onClose}
                />
                <div className="relative bg-b-semidark rounded-2xl shadow-2xl w-full max-w-md transform transition-all duration-300 scale-100">
                    {/* Header */}
                    <div className={`p-6 ${style.bg} ${style.border} border rounded-t-2xl`}>
                        <div className="flex items-center space-x-3">
                            <div className={`w-12 h-12 rounded-full ${style.bg} flex items-center justify-center`}>
                                <IconComponent className={`w-6 h-6 ${style.icon}`} />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-t-light">{title}</h3>
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                        <p className="text-t-light leading-relaxed">{message}</p>
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-3 p-6 pt-0">
                        <button
                            onClick={onClose}
                            className="flex-1 px-4 py-3 bg-b-darklight hover:bg-b-semidark text-t-light rounded-xl transition-colors font-medium"
                        >
                            {cancelText}
                        </button>
                        <button
                            onClick={() => {
                                onConfirm();
                                onClose();
                            }}
                            className={`flex-1 px-4 py-3 ${style.button} text-white rounded-xl transition-colors font-medium`}
                        >
                            {confirmText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Three Dots Dropdown Menu Component
const ThreeDotsMenu = ({ options, className = "" }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className={`relative ${className}`} ref={dropdownRef}>
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    setIsOpen(!isOpen);
                }}
                className="py-1.5 hover:bg-b-darklight rounded-lg transition-colors"
                title="More options"
            >
                <MoreVertical className="w-5 h-5 text-t-light " />
            </button>

            {isOpen && (
                <div className="absolute right-0 top-full mt-1 w-32 bg-b-semidark border border-bor rounded-lg shadow-lg z-50">
                    {options.map((option, index) => (
                        <button
                            key={index}
                            onClick={(e) => {
                                e.stopPropagation();
                                option.onClick();
                                setIsOpen(false);
                            }}
                            className={`w-full px-3 py-2 text-left text-sm hover:bg-b-darklight transition-colors flex items-center space-x-2 ${
                                index === 0 ? 'rounded-t-lg' : ''
                            } ${index === options.length - 1 ? 'rounded-b-lg' : ''} ${option.danger ? 'text-t-red hover:bg-red-500/10' : 'text-t-light'}`}
                        >
                            <option.icon className="w-3.5 h-3.5" />
                            <span>{option.label}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

// Custom Dropdown Component with Hover
const Dropdown = ({
    options = [],
    value,
    onChange,
    placeholder = "Select option...",
    className = "",
    disabled = false,
    leftIcon: LeftIcon,
    size = "md",
    enableHover = true,
    customTrigger,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const dropdownRef = useRef(null);
    const portalRef = useRef(null);
    const hoverTimeoutRef = useRef(null);

    const sizes = {
        sm: "px-3 py-2 text-sm",
        md: "px-4 py-3 text-sm",
        lg: "px-5 py-4 text-base",
    };

    const filteredOptions = options.filter((option) => {
        const searchText = option.label || option.name || '';
        return searchText.toLowerCase().includes(searchTerm.toLowerCase());
    });

    const selectedOption = options.find((opt) => opt.value === value);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            const isClickInTrigger = dropdownRef.current && dropdownRef.current.contains(event.target);
            const isClickInPortal = portalRef.current && portalRef.current.contains(event.target);
            
            if (!isClickInTrigger && !isClickInPortal) {
                setIsOpen(false);
                setSearchTerm("");
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Close on escape key
    useEffect(() => {
        const handleEscape = (event) => {
            if (event.key === "Escape") {
                setIsOpen(false);
                setSearchTerm("");
            }
        };

        if (isOpen) {
            document.addEventListener("keydown", handleEscape);
            return () => document.removeEventListener("keydown", handleEscape);
        }
    }, [isOpen]);

    // Hover handlers
    const handleMouseEnter = () => {
        if (enableHover && !disabled) {
            if (hoverTimeoutRef.current) {
                clearTimeout(hoverTimeoutRef.current);
            }
            setIsOpen(true);
        }
    };

    const handleMouseLeave = () => {
        if (enableHover && !disabled) {
            hoverTimeoutRef.current = setTimeout(() => {
                setIsOpen(false);
                setSearchTerm("");
            }, 150); // 150ms delay before closing
        }
    };

    const handleSelect = (option) => {
        onChange(option.value);
        setIsOpen(false);
        setSearchTerm("");
    };

    const handleClick = () => {
        if (!disabled) {
            setIsOpen(!isOpen);
        }
    };

    return (
        <div
            className={`relative ${className}`}
            ref={dropdownRef}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            {/* Trigger Button */}
            {customTrigger ? (
                <div onClick={handleClick}>
                    {customTrigger(isOpen)}
                </div>
            ) : (
                <button
                    type="button"
                    onClick={handleClick}
                    disabled={disabled}
                    className={`w-full min-w-0 px-4 py-3 text-base bg-b-darklight text-t-light rounded-2xl transition-all duration-200 hover:border-borlight focus:border-bor-grn focus:ring-2 focus:ring-bor-grn/20 focus:outline-none flex items-center justify-between ${
                        disabled
                            ? "opacity-50 cursor-not-allowed"
                            : "cursor-pointer"
                    } ${isOpen ? "border-bor-grn ring-2 ring-bor-grn/20" : ""}`}
                >
                    <div className="flex items-center space-x-2 min-w-0 flex-1">
                        {LeftIcon && (
                            <LeftIcon className="w-4 h-4 text-t-light flex-shrink-0" />
                        )}
                        <span className="truncate text-left">
                            {selectedOption ? (selectedOption.label || selectedOption.name) : placeholder}
                        </span>
                    </div>
                    <ChevronDown
                        className={`w-4 h-4 text-t-grn transition-transform duration-200 flex-shrink-0 ${
                            isOpen ? "rotate-180" : ""
                        }`}
                    />
                </button>
            )}

            {/* Dropdown Menu with Portal */}
            {isOpen && createPortal(
                (() => {
                    if (!dropdownRef.current) return null;
                    
                    const rect = dropdownRef.current.getBoundingClientRect();
                    const spaceBelow = window.innerHeight - rect.bottom;
                    const spaceAbove = rect.top;
                    const dropdownHeight = 200; // Estimated
                    
                    const openUpward = spaceAbove > spaceBelow && spaceBelow < dropdownHeight;
                    
                    return (
                        <div
                            ref={portalRef}
                            className="bg-b-semidark border border-bor rounded-2xl shadow-xl overflow-hidden"
                            style={{
                                position: 'fixed',
                                left: `${Math.max(8, Math.min(window.innerWidth - 220, rect.left))}px`,
                                top: openUpward 
                                    ? `${rect.top - 8}px`
                                    : `${rect.bottom + 8}px`,
                                transform: openUpward ? 'translateY(-100%)' : 'none',
                                zIndex: 99999,
                                minWidth: '180px',
                                maxWidth: '280px'
                            }}
                            onMouseEnter={() => {
                                if (hoverTimeoutRef.current) {
                                    clearTimeout(hoverTimeoutRef.current);
                                }
                            }}
                        >
                            {/* Search Input (if more than 5 options) */}
                            {options.length > 5 && (
                                <div className="p-3 border-b border-bor">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-t-light" />
                                        <input
                                            type="text"
                                            placeholder="Search options..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="w-full pl-10 pr-4 py-2 bg-b-semidark text-t-light placeholder-t-mut border border-bor rounded-lg focus:border-bor-grn focus:ring-1 focus:ring-bor-grn focus:outline-none text-sm hide-scrollbar"
                                            autoFocus
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Options List */}
                            <div className="max-h-48 overflow-y-auto hide-scrollbar">
                                {filteredOptions.length > 0 ? (
                                    filteredOptions.map((option) => {

                                        // Handle header
                                        if (option.isHeader) {
                                            return (
                                                <div key={option.value} className="px-4 py-2 text-xs font-semibold text-t-darkmut uppercase tracking-wide">
                                                    {option.label}
                                                </div>
                                            );
                                        }
                                        
                                        // Skip disabled headers that don't have special flags
                                        if (option.disabled && option.value.startsWith('__')) {
                                            return null;
                                        }
                                        
                                        return (
                                            <button
                                                key={option.value}
                                                onClick={() => handleSelect(option)}
                                                className={`w-full px-4 py-3 text-left hover:bg-b-closedark transition-colors duration-150 flex items-center space-x-3 ${
                                                    value === option.value
                                                        ? "bg-b-acc/20 text-t-light"
                                                        : "text-t-light"
                                                }`}
                                            >
                                                {option.icon && (
                                                    <option.icon
                                                        className={`w-4 h-4 flex-shrink-0 ${
                                                            option.color || "text-t-light"
                                                        }`}
                                                    />
                                                )}
                                                <div className="min-w-0 flex-1">
                                                    <div className="font-medium truncate">
                                                        {option.label || option.name}
                                                    </div>
                                                    {option.description && (
                                                        <div className="text-xs text-t-light truncate mt-0.5">
                                                            {option.description}
                                                        </div>
                                                    )}
                                                </div>
                                                {value === option.value && (
                                                    <Check className="w-4 h-4 text-t-grn flex-shrink-0" />
                                                )}
                                            </button>
                                        );
                                    })
                                ) : (
                                    <div className="px-4 py-3 text-t-light text-sm text-center">
                                        No options found
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })(),
                document.body
            )}
        </div>
    );
};

const TASK_CATEGORIES = {
    CONTENT: {
        id: 'content',
        name: 'Content Planning',
        icon: Twitch,
        color: 'purple',
        workflow: ['draft', 'in-progress', 'review', 'scheduled', 'published'],
        statusLabels: {
            'draft': 'Draft',
            'in-progress': 'In Progress',
            'review': 'Review', 
            'scheduled': 'Scheduled',
            'published': 'Published'
        }
    },
    PROJECT: {
        id: 'project',
        name: 'Project Management',
        icon: Briefcase,
        color: 'blue',
        workflow: ['todo', 'in-progress', 'review', 'testing', 'completed'],
        statusLabels: {
            'todo': 'To Do',
            'in-progress': 'In Progress',
            'review': 'Review',
            'testing': 'Testing',
            'completed': 'Completed'
        }
    },
    SALES: {
        id: 'sales',
        name: 'Sales Pipeline',
        icon: Waypoints,
        color: 'green',
        workflow: ['lead', 'qualified', 'proposal', 'negotiation', 'closed'],
        statusLabels: {
            'lead': 'Lead',
            'qualified': 'Qualified',
            'proposal': 'Proposal',
            'negotiation': 'Negotiation',
            'closed': 'Closed'
        }
    }
};

const PRIORITY_CONFIG = {
    low: {
        value: 'low',
        label: 'Low',
        icon: Circle,
        color: 'text-green-400',
        bgClass: 'bg-green-500/20 text-green-400',
        order: 1
    },
    medium: {
        value: 'medium', 
        label: 'Medium',
        icon: AlertCircle,
        color: 'text-yellow-400',
        bgClass: 'bg-yellow-500/20 text-yellow-400',
        order: 2
    },
    high: {
        value: 'high',
        label: 'High', 
        icon: AlertTriangle,
        color: 'text-orange-400',
        bgClass: 'bg-red-500/20 text-t-red-badge', // High = red background
        order: 3
    },
    urgent: {
        value: 'urgent',
        label: 'Urgent',
        icon: Zap,
        color: 'text-t-red',
        bgClass: 'bg-red-500/20 text-t-red-badge',
        order: 4
    }
};

// Helper function untuk get priority options
const getPriorityOptions = (includeUrgent = true) => {
    const priorities = ['low', 'medium', 'high'];
    if (includeUrgent) {
        priorities.push('urgent');
    }
    
    return priorities.map(key => ({
        value: PRIORITY_CONFIG[key].value,
        label: PRIORITY_CONFIG[key].label,
        icon: PRIORITY_CONFIG[key].icon,
        color: PRIORITY_CONFIG[key].color
    }));
};

const getPriorityDisplay = (priority) => {
    const config = PRIORITY_CONFIG[priority];
    if (!config) {
        return { 
            label: 'Normal', 
            color: 'text-t-mut', 
            bgClass: 'bg-gray-500/20 text-gray-400' 
        };
    }
    return config;
};

const getStatusOptions = (category) => {
    const baseOption = { value: "all", label: "All Status", icon: Circle, color: "text-t-light" };
    
    if (category === 'all') {
        // Return all possible statuses from all categories
        const allStatuses = new Set();
        Object.values(TASK_CATEGORIES).forEach(cat => {
            cat.workflow.forEach(status => allStatuses.add(status));
        });
        
        return [
            baseOption,
            ...Array.from(allStatuses).map(status => ({
                value: status,
                label: status.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
                icon: getStatusIcon(status),
                color: getStatusColor(status)
            }))
        ];
    }
    
    const categoryConfig = TASK_CATEGORIES[category.toUpperCase()];
    if (!categoryConfig) return [baseOption];
    
    return [
        baseOption,
        ...categoryConfig.workflow.map(status => ({
            value: status,
            label: categoryConfig.statusLabels[status],
            icon: getStatusIcon(status),
            color: getStatusColor(status)
        }))
    ];
};

const getStatusIcon = (status) => {
    const iconMap = {
        'todo': Circle,
        'idea': Circle,
        'planned': Circle,
        'in-progress': Clock,
        'draft': Edit3,
        'review': Eye,
        'approval': CheckCircle2,
        'confirmed': CheckCircle2,
        'ongoing': Activity,
        'scheduled': CalendarIcon,
        'done': Check,
        'published': CheckCircle2,
        'completed': CheckCircle2
    };
    return iconMap[status] || Circle;
};

const getStatusColor = (status, category = null) => {
    const colorMap = {
        'todo': 'text-t-light',
        'idea': 'text-t-blue',
        'planned': 'text-t-blue',
        'in-progress': 'text-yellow-500',
        'draft': 'text-orange-500',
        'review': 'text-t-purp',
        'approval': 'text-t-blue',
        'confirmed': 'text-t-grn',
        'ongoing': 'text-yellow-500',
        'scheduled': 'text-cyan-500',
        'done': 'text-t-grn',
        'published': 'text-t-grn',
        'completed': 'text-t-grn'
    };
    return colorMap[status] || 'text-t-light';
};

const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric"
    });
};

const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit"
    });
};

const Avatar = ({ name, size = "md", src = null }) => {
    const sizeClasses = {
        sm: "w-6 h-6 text-xs",
        md: "w-8 h-8 text-sm",
        lg: "w-10 h-10 text-base",
    };

    // Priority: 1. src prop, 2. current user avatar (if same name), 3. initials
    let avatarSrc = null;
    
    if (src) {
        avatarSrc = src;
    } else if (name === window.Laravel?.user?.name) {
        avatarSrc = window.Laravel?.user?.avatar_url;
    }

    if (avatarSrc) {
        return (
            <img
                src={avatarSrc}
                alt={name}
                className={`${sizeClasses[size]} rounded-full object-cover border-2 border-bor`}
                onError={(e) => {
                    // Fallback to initials if image fails to load
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                }}
            />
        );
    }

    // Fallback initials
    const initials = name.split(" ").map(n => n[0]).join("").slice(0, 2);
    const colors = ["bg-b-red", "bg-b-blue", "bg-b-grn", "bg-b-darklight"];
    const colorIndex = name.length % colors.length;

    return (
        <div className={`${sizeClasses[size]} ${colors[colorIndex]} rounded-full flex items-center justify-center text-t-light font-medium`}>
            {initials}
        </div>
    );
};

// Universal Status Mapping - Simple & Clear
const STATUS_MAPPING = {
    NOT_STARTED: ['draft', 'todo', 'lead', 'idea'],
    IN_PROGRESS: ['in-progress', 'in-progress', 'ongoing', 'qualified', 'review'],
    SCHEDULED: ['scheduled', 'planned', 'confirmed', 'proposal'],
    COMPLETED: ['published', 'done', 'completed', 'selesai', 'closed']
};

const getTaskStatusCategory = (task) => {
    // Special handling untuk Sales Pipeline
    if (task.category === 'sales') {
        const dealStage = task.dealStage;
        if (!dealStage) return 'NOT_STARTED';
        
        // Map deal stages ke status categories
        if (['lead'].includes(dealStage)) return 'NOT_STARTED';
        if (['qualified', 'proposal', 'negotiation'].includes(dealStage)) return 'IN_PROGRESS';
        if (['closed'].includes(dealStage)) return 'COMPLETED';
        
        return 'NOT_STARTED';
    }
    
    // Regular status handling untuk Content & Project
    const status = task.status;
    for (const [category, statuses] of Object.entries(STATUS_MAPPING)) {
        if (statuses.includes(status)) return category;
    }
    return 'NOT_STARTED';
};

const isActiveTask = (task) => {
    const statusCategory = getTaskStatusCategory(task);
    return statusCategory !== 'COMPLETED';
};

const isOngoingTask = (task) => {
    const statusCategory = getTaskStatusCategory(task); // ← Ubah dari task.status ke task
    const now = new Date();
    const taskDate = new Date(task.dueDate);
    const isDueToday = taskDate.toDateString() === now.toDateString();
    
    return statusCategory === 'IN_PROGRESS' || 
           (isDueToday && statusCategory !== 'COMPLETED');
};

// API Functions
const api = {
    // Get CSRF token from meta tag
    getCsrfToken: () => {
        return document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
    },

    // Fetch all tasks with filters
    fetchTasks: async (filters = {}) => {
        try {
            const params = new URLSearchParams();
            Object.entries(filters).forEach(([key, value]) => {
                if (value && value !== 'all') {
                    params.append(key, value);
                }
            });

            const response = await fetch(`/api/tasks?${params.toString()}`, {
                headers: {
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': api.getCsrfToken(),
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching tasks:', error);
            throw error;
        }
    },

    // Task Comments API
    fetchComments: async (taskId) => {
        try {
            const response = await fetch(`/api/tasks/${taskId}/comments`, {
                headers: {
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': api.getCsrfToken(),
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching comments:', error);
            throw error;
        }
    },

    createComment: async (taskId, commentData) => {
        try {
            const response = await fetch(`/api/tasks/${taskId}/comments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': api.getCsrfToken(),
                },
                body: JSON.stringify(commentData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error creating comment:', error);
            throw error;
        }
    },

    updateComment: async (commentId, commentData) => {
        try {
            const response = await fetch(`/api/comments/${commentId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': api.getCsrfToken(),
                },
                body: JSON.stringify(commentData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error updating comment:', error);
            throw error;
        }
    },

    deleteComment: async (commentId) => {
        try {
            const response = await fetch(`/api/comments/${commentId}`, {
                method: 'DELETE',
                headers: {
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': api.getCsrfToken(),
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error deleting comment:', error);
            throw error;
        }
    },

    // Task Activities API
    fetchActivities: async (taskId) => {
        try {
            const response = await fetch(`/api/tasks/${taskId}/activities`, {
                headers: {
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': api.getCsrfToken(),
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching activities:', error);
            throw error;
        }
    },

    // Create new task
    createTask: async (taskData) => {
        try {
            const response = await fetch('/api/tasks', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': api.getCsrfToken(),
                },
                body: JSON.stringify(taskData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error creating task:', error);
            throw error;
        }
    },

    // Update existing task
    updateTask: async (taskId, taskData) => {
        try {
            const response = await fetch(`/api/tasks/${taskId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': api.getCsrfToken(),
                },
                body: JSON.stringify(taskData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error updating task:', error);
            throw error;
        }
    },

    // Delete task
    deleteTask: async (taskId) => {
        try {
            const response = await fetch(`/api/tasks/${taskId}`, {
                method: 'DELETE',
                headers: {
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': api.getCsrfToken(),
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error deleting task:', error);
            throw error;
        }
    },

    // Fetch task statistics
    fetchStats: async (filters = {}) => {
        try {
            const params = new URLSearchParams();
            Object.entries(filters).forEach(([key, value]) => {
                if (value) {
                    params.append(key, value);
                }
            });

            const response = await fetch(`/api/tasks/stats?${params.toString()}`, {
                headers: {
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': api.getCsrfToken(),
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching stats:', error);
            throw error;
        }
    },
    
    // Notification API
    fetchNotifications: async () => {
        try {
            const response = await fetch('/api/notifications', {
                headers: {
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': api.getCsrfToken(),
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching notifications:', error);
            throw error;
        }
    },

    fetchUnreadCount: async () => {
        try {
            const response = await fetch('/api/notifications/unread-count', {
                headers: {
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': api.getCsrfToken(),
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching unread count:', error);
            throw error;
        }
    },

    markNotificationAsRead: async (notificationId) => {
        try {
            const response = await fetch(`/api/notifications/${notificationId}/read`, {
                method: 'PUT',
                headers: {
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': api.getCsrfToken(),
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error marking notification as read:', error);
            throw error;
        }
    },

    // Workspace Activities API
    fetchWorkspaceActivities: async (workspaceId = null) => {
        try {
            const params = workspaceId ? `?workspace_id=${workspaceId}` : '';
            const response = await fetch(`/api/workspace-activities${params}`, {
                headers: {
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': api.getCsrfToken(),
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching workspace activities:', error);
            throw error;
        }
    },
};

// Workspace API Functions
const workspaceApi = {
    // Get CSRF token
    getCsrfToken: () => {
        return document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
    },

    // Fetch all workspaces
    fetchWorkspaces: async () => {
        try {
            const response = await fetch('/api/workspaces', {
                headers: {
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': workspaceApi.getCsrfToken(),
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching workspaces:', error);
            throw error;
        }
    },

    // Create new workspace
    createWorkspace: async (workspaceData) => {
        try {
            const response = await fetch('/api/workspaces', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': workspaceApi.getCsrfToken(),
                },
                body: JSON.stringify(workspaceData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error creating workspace:', error);
            throw error;
        }
    },

    // Get workspace members
    getWorkspaceMembers: async (workspaceId) => {
        try {
            const response = await fetch(`/api/workspaces/${workspaceId}/members`, {
                headers: {
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': workspaceApi.getCsrfToken(),
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching workspace members:', error);
            throw error;
        }
    },

    // Invite member
    inviteMember: async (workspaceId, memberData) => {
        try {
            const response = await fetch(`/api/workspaces/${workspaceId}/invite`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': workspaceApi.getCsrfToken(),
                },
                body: JSON.stringify(memberData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }

            return await response.json(); // <-- RETURN FULL RESPONSE
        } catch (error) {
            console.error('Error inviting member:', error);
            throw error;
        }
    },

    // Remove member
    removeMember: async (workspaceId, userId) => {
        try {
            const response = await fetch(`/api/workspaces/${workspaceId}/members/${userId}`, {
                method: 'DELETE',
                headers: {
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': workspaceApi.getCsrfToken(),
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error removing member:', error);
            throw error;
        }
    },

    updateMember: async (workspaceId, userId, memberData) => {
        try {
            const response = await fetch(`/api/workspaces/${workspaceId}/members/${userId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': workspaceApi.getCsrfToken(),
                },
                body: JSON.stringify(memberData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error updating member:', error);
            throw error;
        }
    }

};

// Client API Functions
const clientApi = {
    getCsrfToken: () => {
        return document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
    },

    // Fetch clients for a workspace
    fetchClients: async (workspaceId, filters = {}) => {
        try {
            const params = new URLSearchParams({ workspace_id: workspaceId, ...filters });
            const response = await fetch(`/api/clients?${params.toString()}`, {
                headers: {
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': clientApi.getCsrfToken(),
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching clients:', error);
            throw error;
        }
    },

    // Create new client
    createClient: async (clientData) => {
        try {
            const response = await fetch('/api/clients', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': clientApi.getCsrfToken(),
                },
                body: JSON.stringify(clientData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error creating client:', error);
            throw error;
        }
    },

    // Update client
    updateClient: async (clientId, clientData) => {
        try {
            const response = await fetch(`/api/clients/${clientId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': clientApi.getCsrfToken(),
                },
                body: JSON.stringify(clientData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error updating client:', error);
            throw error;
        }
    },

    // Delete client
    deleteClient: async (clientId) => {
        try {
            const response = await fetch(`/api/clients/${clientId}`, {
                method: 'DELETE',
                headers: {
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': clientApi.getCsrfToken(),
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error deleting client:', error);
            throw error;
        }
    }
};

// Workspace Create Form Component
const WorkspaceCreateForm = ({ onSubmit, onCancel }) => {
    const [formData, setFormData] = useState({
        name: '',
        description: ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (formData.name.trim()) {
            onSubmit(formData);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <Input
                label="Workspace Name"
                placeholder="Marketing Workspace"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
            />
            
            <div>
                <label className="block text-sm font-medium text-t-mut mb-1">Description</label>
                <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full px-4 py-3 text-base bg-b-darklight text-t-light rounded-lg focus:ring-1 focus:ring-bor-grn resize-none"
                    placeholder="Workspace for marketing activities..."
                />
            </div>

            <div className="flex space-x-3 pt-4">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-4 py-2 bg-b-darklight hover:bg-b-semidark text-t-light rounded-lg transition-colors"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-b-grn hover:bg-b-grn-hov text-t-light rounded-lg transition-colors"
                >
                    Create Workspace
                </button>
            </div>
        </form>
    );
};

// Invite Member Form Component
const InviteMemberForm = ({ onSubmit, onCancel }) => {
    const [formData, setFormData] = useState({
        email: '',
        role: 'member',
        member_type: 'internal',        // TAMBAH INI
        external_category: '',          // TAMBAH INI
        notes: ''                       // TAMBAH INI
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (formData.email.trim()) {
            onSubmit(formData);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <Input
                label="Email Address"
                type="email"
                placeholder="john@example.com"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                required
            />
            
            <div>
                <label className="block text-sm font-medium text-t-mut mb-1">Role</label>
                <Dropdown
                    options={[
                        { value: 'member', label: 'Member', icon: User, description: 'Create/edit tasks, collaborate' },
                        { value: 'admin', label: 'Admin', icon: Settings, description: 'Manage members, workspace settings' },
                        { value: 'guest', label: 'Guest', icon: Eye, description: 'Limited access, view/comment only' }
                    ]}
                    value={formData.role}
                    onChange={(value) => setFormData(prev => ({ ...prev, role: value }))}
                    enableHover={false}
                />
            </div>

            {/* TAMBAH SECTION INI: */}
            <div>
                <label className="block text-sm font-medium text-t-mut mb-3">Member Type</label>
                <div className="grid grid-cols-2 gap-3">
                    <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, member_type: 'internal', external_category: '' }))}
                        className={`p-4 rounded-2xl border-2 transition-colors flex flex-col items-center justify-center space-y-2 ${
                            formData.member_type === 'internal'
                                ? 'border-b-grn bg-b-grn/10 text-t-light'
                                : 'border-bor bg-b-darklight text-t-mut hover:border-b-grn hover:bg-b-grn/5'
                        }`}
                    >
                        <div className="w-8 h-8 bg-b-grn/20 rounded-lg flex items-center justify-center">
                            <Users className="w-4 h-4 text-t-grn" />
                        </div>
                        <div className="text-center">
                            <div className="text-sm font-semibold">Internal</div>
                            <div className="text-xs opacity-75">Team member</div>
                        </div>
                    </button>
                    
                    <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, member_type: 'external' }))}
                        className={`p-4 rounded-2xl border-2 transition-colors flex flex-col items-center justify-center space-y-2 ${
                            formData.member_type === 'external'
                                ? 'border-b-blue bg-b-blue/10 text-t-light'
                                : 'border-bor bg-b-darklight text-t-mut hover:border-b-blue hover:bg-b-blue/5'
                        }`}
                    >
                        <div className="w-8 h-8 bg-b-blue/20 rounded-lg flex items-center justify-center">
                            <UserPlus className="w-4 h-4 text-t-blue" />
                        </div>
                        <div className="text-center">
                            <div className="text-sm font-semibold">External</div>
                            <div className="text-xs opacity-75">Contractor</div>
                        </div>
                    </button>
                </div>
            </div>

            {/* TAMBAH SECTION INI JUGA: */}
            {formData.member_type === 'external' && (
                <div>
                    <label className="block text-sm font-medium text-t-mut mb-1">External Category</label>
                    <Dropdown
                        options={[
                            { value: 'freelance', label: 'Freelance', icon: User },
                            { value: 'outsourced', label: 'Outsourced Staff', icon: Users },
                            { value: 'vendor', label: 'Vendor', icon: Package }
                        ]}
                        value={formData.external_category}
                        onChange={(value) => setFormData(prev => ({ ...prev, external_category: value }))}
                        placeholder="Select category..."
                        enableHover={false}
                    />
                </div>
            )}

            {/* TAMBAH SECTION INI JUGA: */}
            {formData.member_type === 'external' && (
                <div>
                    <label className="block text-sm font-medium text-t-mut mb-1">Notes</label>
                    <textarea
                        value={formData.notes}
                        onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                        rows={3}
                        className="w-full px-4 py-3 text-base bg-b-darklight text-t-light rounded-lg focus:ring-1 focus:ring-bor-grn resize-none"
                        placeholder="Additional notes about this external member..."
                    />
                </div>
            )}

            <div className="flex space-x-3 pt-4">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-4 py-2 bg-b-darklight hover:bg-b-semidark text-t-light rounded-lg transition-colors"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-b-blue hover:bg-blue-600 text-t-light rounded-lg transition-colors"
                >
                    Send Invite
                </button>
            </div>
        </form>
    );
};

const InvitationLinkDisplay = ({ invitationData, onClose }) => {
    const [copied, setCopied] = useState(false);
    
    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(invitationData.invitation_link);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            console.error('Failed to copy:', error);
        }
    };
    
    return (
        <div className="space-y-4">
            <div className="bg-b-blue/10 border border-b-blue/30 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                    <Info className="w-5 h-5 text-t-blue" />
                    <h3 className="font-semibold text-t-light">Invitation Created</h3>
                </div>
                <p className="text-sm text-t-light mb-3">
                    <strong>{invitationData.invited_email}</strong> is not registered yet. 
                    Share this invitation link with them:
                </p>
                
                <div className="bg-b-semidark rounded-lg p-3 space-y-3">
                    <div className="flex items-center space-x-2">
                        <input
                            type="text"
                            value={invitationData.invitation_link}
                            readOnly
                            className="flex-1 px-3 py-2 bg-b-darklight text-t-light rounded-lg text-sm"
                        />
                        <button
                            onClick={copyToClipboard}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                copied 
                                    ? 'bg-green-500 text-white' 
                                    : 'bg-b-blue hover:bg-blue-600 text-t-light'
                            }`}
                        >
                            {copied ? (
                                <>
                                    <Check className="w-4 h-4 inline mr-1" />
                                    Copied!
                                </>
                            ) : (
                                <>
                                    <Copy className="w-4 h-4 inline mr-1" />
                                    Copy
                                </>
                            )}
                        </button>
                    </div>
                </div>
                
                <div className="mt-3 text-xs text-t-mut">
                    💡 They can use this link to join your workspace. The invitation expires in 7 days.
                </div>
            </div>
            
            <div className="flex space-x-3">
                <button
                    onClick={onClose}
                    className="flex-1 px-4 py-2 bg-b-grn hover:bg-b-grn-hov text-t-light rounded-lg transition-colors font-medium"
                >
                    Done
                </button>
            </div>
        </div>
    );
};

// Komponen ActivityItem untuk menghindari duplikasi kode
const ActivityItem = ({ activity, workspaceMembers, isExpanded, onToggle, showNewLabel = false, showTime = true }) => {
    const hasChanges = activity.metadata && Object.keys(activity.metadata).length > 0;
    
    return (
        <div className="group relative">
            <div 
                className={`flex items-center space-x-3 px-3 py-2 hover:bg-b-darklight rounded-xl transition-all duration-150 cursor-pointer ${
                    isExpanded ? 'bg-b-darklight/30' : ''
                }`}
                onClick={() => hasChanges && onToggle(activity.id)}
            >
                <div className="flex-shrink-0 opacity-75">
                    <Avatar 
                        name={activity.user_name} 
                        size="lg" 
                        src={(() => {
                            const member = workspaceMembers.find(m => m.name === activity.user_name);
                            return member?.avatar || null;
                        })()} 
                    />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex flex-col text-sm leading-tight">
                        {activity.action === 'member_joined' ? (
                            <span>{activity.description}</span>
                        ) : ['note_created', 'note_updated', 'note_deleted'].includes(activity.action) ? (
                            // ✅ NOTES ACTIVITIES
                            <>
                                <div className="flex items-baseline gap-1 text-xs text-t-mut/70">
                                    <span className="font-medium">{activity.user_name.split(' ')[0]}</span>
                                    <span className="text-t-mut">
                                        {activity.action === 'note_created' ? 'added note' :
                                         activity.action === 'note_updated' ? 'updated note' :
                                         'deleted note'}
                                    </span>
                                </div>
                                <span className="font-medium text-t-light truncate">
                                    {activity.metadata?.date ? 
                                        new Date(activity.metadata.date).toLocaleDateString('en-US', { 
                                            month: 'short', 
                                            day: 'numeric' 
                                        }) : 
                                        'Calendar Note'
                                    }
                                </span>
                            </>
                        ) : (
                            // ✅ TASK ACTIVITIES
                            <>
                                <div className="flex items-baseline gap-1 text-xs text-t-mut/70">
                                    <span className="font-medium">{activity.user_name.split(' ')[0]}</span>
                                    <span className="text-t-mut">{activity.action.replace('_', ' ')}</span>
                                </div>
                                <span className="font-medium text-t-light truncate">{activity.task?.title}</span>
                            </>
                        )}
                    </div>
                </div>
                <div className="flex flex-col justify-start items-end gap-0.5">
                    {showNewLabel && (
                        <span className="px-1 py-0.5 bg-b-acc text-t-yel text-[10px] font-medium rounded-md">
                            NEW
                        </span>
                    )}
                    {showTime && (
                        <span className="text-xs text-t-mut">
                            {showTime === 'relative' 
                                ? activity.formatted_time
                                : new Date(activity.created_at).toLocaleTimeString('en-US', { 
                                    hour: 'numeric', 
                                    minute: '2-digit',
                                    hour12: true 
                                })
                            }
                        </span>
                    )}
                </div>
            </div>
            
            {/* Expandable Details */}
            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
                isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
            }`}>
                <div className="mt-2 mb-3 p-4 bg-b-darklight rounded-2xl">
                    {/* Detail content code tetap sama */}
                    {(() => {
                        // ✅ HANDLE NOTES ACTIVITIES FIRST
                        if (['note_created', 'note_updated', 'note_deleted'].includes(activity.action)) {
                            return (
                                <div>                                    
                                    {activity.action === 'note_updated' && (
                                        <>
                                            <div className="flex flex-col">
                                                <span className="text-xs font-medium text-t-mut">Before:</span>
                                                <div className="text-sm bg-b-darklight/50 mb-2">
                                                    {activity.metadata?.old_note || 'No previous note'}
                                                </div>
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-xs font-medium text-t-mut">After:</span>
                                                <div className="text-sm bg-b-darklight/50 mb-2">
                                                    {activity.metadata?.new_note || 'No note content'}
                                                </div>
                                            </div>
                                        </>
                                    )}
                                    
                                    {activity.action === 'note_created' && (
                                        <div className="flex flex-col">
                                            <span className="text-xs font-medium text-t-mut">Note Content</span>
                                            <div className="text-sm bg-b-darklight/50 rounded">
                                                {activity.metadata?.note || 'No note content'}
                                            </div>
                                        </div>
                                    )}
                                    
                                    {activity.action === 'note_deleted' && (
                                        <div className="flex flex-col">
                                            <span className="text-xs font-medium text-t-mut">Deleted Note</span>
                                            <div className="text-sm bg-b-darklight/50 rounded opacity-75 line-through">
                                                {activity.metadata?.deleted_note || 'Note content not available'}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        }
                        
                        // ✅ HANDLE REGULAR TASK ACTIVITIES
                        if (!hasChanges) {
                            return (
                                <p className="text-xs text-t-mut italic">No detailed changes available for this activity</p>
                            );
                        }
                        
                        const formatChangeValue = (value, key) => {
                            if (value === null || value === undefined || value === '') return 'Not set';
                            if (Array.isArray(value)) return value.length > 0 ? value.join(', ') : 'Not set';
                            if (typeof value === 'object') {
                                return 'Not set';
                            }
                            if (key.includes('date') || key.includes('Date')) {
                                try {
                                    return new Date(value).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'short', 
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    });
                                } catch {
                                    return 'Invalid date';
                                }
                            }
                            if (typeof value === 'boolean') return value ? 'Yes' : 'No';
                            const stringValue = String(value).trim();
                            return stringValue || 'Not set';
                        };

                        const isEmptyFormatted = (formattedValue) => {
                            const emptyValues = ['Not set', 'None', '', 'null', 'undefined'];
                            return emptyValues.includes(formattedValue);
                        };

                        const formatFieldName = (key) => {
                            const fieldNames = {
                                'title': 'Title',
                                'description': 'Description', 
                                'status': 'Status',
                                'priority': 'Priority',
                                'due_date': 'Due Date',
                                'assignee_name': 'Assignee',
                                'tags': 'Tags',
                                'notes': 'Notes',
                                'content_type': 'Content Type',
                                'platforms': 'Platforms',
                                'deal_stage': 'Deal Stage',
                                'deal_value': 'Deal Value'
                            };
                            return fieldNames[key] || key.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
                        };

                        const getInformativeChanges = (metadata) => {
                            if (!metadata) return {};
                            
                            const informativeFields = [
                                'title', 'description', 'status', 'priority', 'assignee_name', 
                                'due_date', 'notes', 'tags', 'platforms', 'content_type',
                                'deal_stage', 'deal_value', 'sales_activity', 'contact'
                            ];
                            
                            const filtered = {};
                            
                            Object.entries(metadata).forEach(([key, change]) => {
                                if (!informativeFields.includes(key)) return;
                                
                                const oldFormatted = formatChangeValue(change.old, key);
                                const newFormatted = formatChangeValue(change.new, key);
                                
                                if (isEmptyFormatted(oldFormatted) && isEmptyFormatted(newFormatted)) return;
                                if (oldFormatted === newFormatted) return;
                                
                                const bothEmpty = (
                                    (isEmptyFormatted(oldFormatted) || oldFormatted === '[]') && 
                                    (isEmptyFormatted(newFormatted) || newFormatted === '[]')
                                );
                                if (bothEmpty) return;
                                
                                filtered[key] = change;
                            });
                            
                            return filtered;
                        };
                        
                        const informativeChanges = getInformativeChanges(activity.metadata);
                        const changeCount = Object.keys(informativeChanges).length;
                        
                        if (changeCount === 0) {
                            return (
                                <p className="text-xs text-t-mut italic">No significant changes to display</p>
                            );
                        }
                        
                        return (
                            <div className="space-y-3">
                                {Object.entries(informativeChanges).map(([key, change]) => (
                                    <div key={key} className="flex flex-col space-y-1">
                                        <span className="text-xs font-medium text-t-light">
                                            {formatFieldName(key)}
                                        </span>
                                        <div className="flex flex-col gap-0.5 text-sm">
                                            <div className="flex-1">
                                                <span className="text-t-mut">Before: </span>
                                                <span className="text-sm">
                                                    {formatChangeValue(change.old, key)}
                                                </span>
                                            </div>
                                            <div className="flex-1">
                                                <span className="text-t-mut">After: </span>
                                                <span className="text-sm">
                                                    {formatChangeValue(change.new, key)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        );
                    })()}
                </div>
            </div>
        </div>
    );
};

// Recent Activity Component dengan ref forwarding
const RecentActivity = React.forwardRef(({ currentWorkspace, workspaceMembers = [] }, ref) => {
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedActivity, setExpandedActivity] = useState(null); // Single activity instead of Set

    // Toggle expand/collapse activity - only one at a time
    const toggleActivity = (activityId) => {
        setExpandedActivity(prev => {
            // If clicking the same activity, close it
            if (prev === activityId) {
                return null;
            }
            // Otherwise, open the clicked activity (closes others automatically)
            return activityId;
        });
    };

    const loadActivities = useCallback(async () => {
        try {
            setLoading(true);
            const activitiesData = await api.fetchWorkspaceActivities(currentWorkspace?.id);
            setActivities(activitiesData);
        } catch (error) {
            console.error('Failed to load workspace activities:', error);
        } finally {
            setLoading(false);
        }
    }, [currentWorkspace?.id]);

    // Expose loadActivities via ref
    React.useImperativeHandle(ref, () => ({
        refresh: loadActivities
    }), [loadActivities]);

    useEffect(() => {
        loadActivities();
    }, [loadActivities]);

    const getActivityIcon = (action) => {
        switch (action) {
            case 'task_created':
                return <Plus className="w-4 h-4 text-t-grn" />;
            case 'task_updated':
                return <RefreshCw className="w-4 h-4 text-t-blue" />;
            case 'status_changed':
                return <CheckCircle2 className="w-4 h-4 text-t-grn" />;
            case 'member_joined':
                return <Users className="w-4 h-4 text-t-purp" />;
            case 'note_created':
                return <FileText className="w-4 h-4 text-t-blue" />;
            case 'note_updated':
                return <Edit3 className="w-4 h-4 text-t-yel" />;
            case 'note_deleted':
                return <Trash2 className="w-4 h-4 text-t-red" />;
            default:
                return <Activity className="w-4 h-4 text-t-light" />;
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-8">
                <LoadingSpinner size="sm" />
                <span className="ml-2 text-t-mut">Loading activities...</span>
            </div>
        );
    }

    const groupActivitiesByTime = (activities) => {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
        
        const groups = {
            today: [],
            yesterday: [],
            older: []
        };
        
        activities.forEach(activity => {
            const activityDate = new Date(activity.created_at);
            const activityDay = new Date(activityDate.getFullYear(), activityDate.getMonth(), activityDate.getDate());
            
            if (activityDay.getTime() === today.getTime()) {
                groups.today.push(activity);
            } else if (activityDay.getTime() === yesterday.getTime()) {
                groups.yesterday.push(activity);
            } else {
                groups.older.push(activity);
            }
        });
        
        return groups;
    };

    const groupedActivities = groupActivitiesByTime(activities);

    return (
        <div className="space-y-6">
            {activities.length > 0 ? (
                <>
                    {/* Today */}
                    {groupedActivities.today.length > 0 && (
                        <div>
                            <h4 className="text-xs font-semibold text-t-mut uppercase tracking-wide mb-3 px-1">Today</h4>
                            <div className="space-y-1">
                                {groupedActivities.today.map((activity, index) => (
                                    <ActivityItem
                                        key={activity.id}
                                        activity={activity}
                                        workspaceMembers={workspaceMembers}
                                        isExpanded={expandedActivity === activity.id}
                                        onToggle={toggleActivity}
                                        showNewLabel={index < 3} // NEW label untuk 3 aktivitas pertama hari ini
                                        showTime={true} // Format jam:menit
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Yesterday */}
                    {groupedActivities.yesterday.length > 0 && (
                        <div>
                            <h4 className="text-xs font-semibold text-t-mut uppercase tracking-wide mb-3 px-1">Yesterday</h4>
                            <div className="space-y-1">
                                {groupedActivities.yesterday.map((activity) => (
                                    <ActivityItem
                                        key={activity.id}
                                        activity={activity}
                                        workspaceMembers={workspaceMembers}
                                        isExpanded={expandedActivity === activity.id}
                                        onToggle={toggleActivity}
                                        showNewLabel={false} // Tidak ada NEW label
                                        showTime={true} // Format jam:menit
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Older */}
                    {groupedActivities.older.length > 0 && (
                        <div>
                            <h4 className="text-xs font-semibold text-t-mut uppercase tracking-wide mb-3 px-1">Earlier</h4>
                            <div className="space-y-1">
                                {groupedActivities.older.slice(0, 10).map((activity) => (
                                    <ActivityItem
                                        key={activity.id}
                                        activity={activity}
                                        workspaceMembers={workspaceMembers}
                                        isExpanded={expandedActivity === activity.id}
                                        onToggle={toggleActivity}
                                        showNewLabel={false} // Tidak ada NEW label
                                        showTime="relative" // Format "X hours ago"
                                    />
                                ))}
                                {groupedActivities.older.length > 10 && (
                                    <div className="text-center pt-2">
                                        <span className="text-xs text-t-mut">+{groupedActivities.older.length - 10} more activities</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </>
            ) : (
                <div className="text-center py-12">
                    <div className="w-12 h-12 mx-auto mb-4 bg-b-darklight rounded-xl flex items-center justify-center">
                        <Activity className="w-6 h-6 text-t-mut" />
                    </div>
                    <h4 className="text-sm font-medium text-t-light mb-1">No workspace activity yet</h4>
                    <p className="text-xs text-t-mut">
                        Activities will appear when workspace members<br />create or update tasks
                    </p>
                </div>
            )}
        </div>
    );
});

const calculateStatusDistribution = (contents, dateRange = null) => {
    // Filter tasks by date range if provided
    let filteredContents = contents;
    if (dateRange && dateRange.start && dateRange.end) {
        const startDate = new Date(dateRange.start);
        const endDate = new Date(dateRange.end);
        filteredContents = contents.filter(task => {
            const taskDate = new Date(task.updatedAt);
            return taskDate >= startDate && taskDate <= endDate;
        });
    }

    const distribution = {};
    filteredContents.forEach(task => {
        const category = getTaskStatusCategory(task); // ← Ubah dari task.status ke task
        distribution[category] = (distribution[category] || 0) + 1;
    });
    
    const total = filteredContents.length;
    
    if (total === 0) {
        return {
            notStarted: 0,
            inProgress: 0,
            completed: 0,
            hasData: false // ← Tambah flag untuk UI
        };
    }
    
    return {
        notStarted: Math.round(((distribution.NOT_STARTED || 0) / total) * 100),
        inProgress: Math.round(((distribution.IN_PROGRESS || 0) / total) * 100),
        completed: Math.round(((distribution.COMPLETED || 0) / total) * 100),
        hasData: true // ← Ada data
    };
};

const calculateProductivityTrend = (contents, dateRange = null) => {
    // Filter tasks by date range if provided
    let filteredContents = contents;
    if (dateRange && dateRange.start && dateRange.end) {
        const startDate = new Date(dateRange.start);
        const endDate = new Date(dateRange.end);
        filteredContents = contents.filter(task => {
            const taskDate = new Date(task.updatedAt);
            return taskDate >= startDate && taskDate <= endDate;
        });
    }

    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    // REAL Math: Completed tasks by time period
    const thisWeekCompleted = filteredContents.filter(task => {
        const completedDate = new Date(task.updatedAt);
        return ['published', 'done', 'completed', 'selesai', 'closed'].includes(task.status) && 
               completedDate >= oneWeekAgo;
    });
    
    const lastWeekCompleted = filteredContents.filter(task => {
        const completedDate = new Date(task.updatedAt);
        return ['published', 'done', 'completed', 'selesai', 'closed'].includes(task.status) && 
               completedDate >= twoWeeksAgo && completedDate < oneWeekAgo;
    });
    
    const last30DaysCompleted = filteredContents.filter(task => {
        const completedDate = new Date(task.updatedAt);
        return ['published', 'done', 'completed', 'selesai', 'closed'].includes(task.status) && 
               completedDate >= thirtyDaysAgo;
    });
    
    // REAL Math: Trend calculation
    const trend = thisWeekCompleted.length - lastWeekCompleted.length;
    
    // REAL Math: Average completion time for completed tasks
    const completedTasksWithDates = last30DaysCompleted.filter(task => 
        task.createdAt && task.updatedAt
    );
    
    const avgDuration = completedTasksWithDates.length > 0 ? 
        completedTasksWithDates.reduce((sum, task) => {
            const created = new Date(task.createdAt);
            const completed = new Date(task.updatedAt);
            return sum + (completed - created) / (1000 * 60 * 60 * 24);
        }, 0) / completedTasksWithDates.length : 0;

    // REAL Math: Velocity calculation
    const weeklyVelocity = thisWeekCompleted.length;
    const monthlyVelocity = last30DaysCompleted.length;
    
    return {
        thisWeek: thisWeekCompleted.length,
        lastWeek: lastWeekCompleted.length,
        last30Days: last30DaysCompleted.length,
        trend: trend,
        avgDuration: Math.round(avgDuration * 10) / 10,
        weeklyVelocity,
        monthlyVelocity,
        chartData: [lastWeekCompleted.length, thisWeekCompleted.length],
        
        // Trend analysis
        trendDirection: trend > 0 ? 'increasing' : trend < 0 ? 'decreasing' : 'stable',
        trendPercent: lastWeekCompleted.length > 0 ? 
            Math.round((trend / lastWeekCompleted.length) * 100) : 0,
            
        // Data quality
        dataQuality: completedTasksWithDates.length >= 10 ? 'Good' : 
                    completedTasksWithDates.length >= 5 ? 'Fair' : 'Poor'
    };
};

const calculatePerformanceBenchmarking = (contents, workspaceMembers, dateRange = null) => {
    // Filter tasks by date range if provided
    let filteredContents = contents;
    if (dateRange && dateRange.start && dateRange.end) {
        const startDate = new Date(dateRange.start);
        const endDate = new Date(dateRange.end);
        filteredContents = contents.filter(task => {
            const taskDate = new Date(task.updatedAt);
            return taskDate >= startDate && taskDate <= endDate;
        });
    }

    if (!filteredContents.length || !workspaceMembers.length) return {
        velocityScore: 0,
        industryComparison: 'Insufficient data',
        efficiencyRank: 'Unknown',
        recommendations: ['Collect more task completion data for meaningful analysis']
    };

    // REAL Math: Calculate actual workspace metrics
    const completedTasks = filteredContents.filter(task => 
        ['published', 'done', 'completed', 'selesai', 'closed'].includes(task.status)
    );
    
    const totalTasks = filteredContents.length;
    const completionRate = (completedTasks.length / totalTasks) * 100;
    
    // REAL Math: Tasks per person calculation
    const tasksPerPerson = totalTasks / workspaceMembers.length;
    const completedTasksPerPerson = completedTasks.length / workspaceMembers.length;
    
    // REAL Math: Average cycle time from real data
    const tasksWithDates = completedTasks.filter(task => 
        task.createdAt && task.updatedAt
    );
    
    const avgCycleTime = tasksWithDates.length > 0 ? 
        tasksWithDates.reduce((sum, task) => {
            const created = new Date(task.createdAt);
            const completed = new Date(task.updatedAt);
            return sum + (completed - created) / (1000 * 60 * 60 * 24);
        }, 0) / tasksWithDates.length : 0;

    // REAL Analysis: Performance scoring based on actual data
    const velocityScore = Math.round(completedTasksPerPerson * 10); // 1 completed task = 10 points
    
    // HONEST Assessment: No fake industry comparison
    let efficiencyRank = 'Unknown';
    let industryComparison = 'No benchmark data';
    
    if (completionRate >= 90) {
        efficiencyRank = 'Excellent';
    } else if (completionRate >= 75) {
        efficiencyRank = 'Good';
    } else if (completionRate >= 60) {
        efficiencyRank = 'Average';
    } else {
        efficiencyRank = 'Needs Improvement';
    }
    
    // REAL Recommendations based on actual data patterns
    const recommendations = [];
    
    if (completionRate < 70) {
        recommendations.push('Focus on completing existing tasks before starting new ones');
    }
    
    if (avgCycleTime > 14) {
        recommendations.push('Review task complexity - average cycle time is high');
    }
    
    if (tasksPerPerson > 5) {
        recommendations.push('Consider redistributing workload - high task count per person');
    }
    
    const stuckTasks = filteredContents.filter(task => {
        const daysSinceUpdate = (new Date() - new Date(task.updatedAt)) / (1000 * 60 * 60 * 24);
        return daysSinceUpdate > 7 && !['published', 'done', 'completed', 'selesai', 'closed'].includes(task.status);
    }).length;
    
    if (stuckTasks > 0) {
        recommendations.push(`Review ${stuckTasks} tasks that haven't been updated in >7 days`);
    }
    
    if (recommendations.length === 0) {
        recommendations.push('Workspace performance is on track - maintain current practices');
    }

    return {
        // Real metrics
        velocityScore,
        completionRate: Math.round(completionRate),
        avgCycleTime: Math.round(avgCycleTime * 10) / 10,
        tasksPerPerson: Math.round(tasksPerPerson * 10) / 10,
        completedTasksPerPerson: Math.round(completedTasksPerPerson * 10) / 10,
        
        // Honest assessment
        industryComparison,
        efficiencyRank,
        recommendations,
        
        // Data quality indicators
        dataQuality: tasksWithDates.length >= 10 ? 'Good' : tasksWithDates.length >= 5 ? 'Fair' : 'Poor',
        sampleSize: tasksWithDates.length
    };
};

const calculatePredictiveForecasting = (contents, workspaceMembers, dateRange = null) => {
    // Filter tasks by date range if provided
    let filteredContents = contents;
    if (dateRange && dateRange.start && dateRange.end) {
        const startDate = new Date(dateRange.start);
        const endDate = new Date(dateRange.end);
        filteredContents = contents.filter(task => {
            const taskDate = new Date(task.updatedAt);
            return taskDate >= startDate && taskDate <= endDate;
        });
    }

    if (!filteredContents.length) return {
        quarterlyForecast: 0,
        deliveryPrediction: 95,
        riskAdjustedTimeline: '2-3 weeks',
        confidenceLevel: 'Low',
        bottleneckPrediction: 'None',
        resourceNeed: 'Adequate'
    };

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    // REAL Math: Calculate actual completion velocity
    const recentlyCompleted = filteredContents.filter(task => {
        const completedDate = new Date(task.updatedAt);
        return ['published', 'done', 'completed', 'selesai', 'closed'].includes(task.status) &&
               completedDate >= thirtyDaysAgo;
    });
    
    const lastWeekCompleted = recentlyCompleted.filter(task => {
        const completedDate = new Date(task.updatedAt);
        return completedDate >= sevenDaysAgo;
    });
    
    // Real velocity calculation
    const last30DaysVelocity = recentlyCompleted.length / 30; // tasks per day
    const lastWeekVelocity = lastWeekCompleted.length / 7; // tasks per day
    const currentVelocity = lastWeekVelocity > 0 ? lastWeekVelocity : last30DaysVelocity;
    
    // Current active tasks
    const activeTasks = filteredContents.filter(task => 
        !['published', 'done', 'completed', 'selesai', 'closed'].includes(task.status)
    );
    
    // REAL Math: Time to complete current backlog
    const daysToComplete = currentVelocity > 0 ? activeTasks.length / currentVelocity : 999;
    
    // REAL Math: Quarterly projection based on actual velocity
    const quarterlyForecast = Math.round(currentVelocity * 90); // 90 days in quarter
    
    // REAL Math: Delivery confidence based on historical performance
    const totalTasksLast30Days = filteredContents.filter(task => {
        const taskDate = new Date(task.createdAt);
        return taskDate >= thirtyDaysAgo;
    }).length;
    
    const completionRate = totalTasksLast30Days > 0 ? 
        (recentlyCompleted.length / totalTasksLast30Days) * 100 : 
        95;
    
    // REAL Math: Risk-adjusted timeline
    let riskAdjustedTimeline;
    if (daysToComplete <= 7) {
        riskAdjustedTimeline = '1 week';
    } else if (daysToComplete <= 14) {
        riskAdjustedTimeline = '2 weeks';
    } else if (daysToComplete <= 30) {
        riskAdjustedTimeline = '1 month';
    } else if (daysToComplete <= 60) {
        riskAdjustedTimeline = '2 months';
    } else {
        riskAdjustedTimeline = '>2 months';
    }
    
    // REAL Math: Confidence level based on data quality
    let confidenceLevel = 'Medium';
    if (recentlyCompleted.length < 5) {
        confidenceLevel = 'Low';
    } else if (recentlyCompleted.length >= 15 && Math.abs(lastWeekVelocity - last30DaysVelocity) < 0.2) {
        confidenceLevel = 'High';
    }
    
    // REAL Math: Bottleneck detection
    const workloadAnalysis = {};
    workspaceMembers.forEach(member => {
        workloadAnalysis[member.id] = {
            name: member.name,
            activeTasks: 0
        };
    });
    
    activeTasks.forEach(task => {
        if (workloadAnalysis[task.assignee.id]) {
            workloadAnalysis[task.assignee.id].activeTasks++;
        }
    });
    
    const taskCounts = Object.values(workloadAnalysis).map(m => m.activeTasks);
    const avgTasks = taskCounts.reduce((sum, count) => sum + count, 0) / taskCounts.length;
    const bottleneckedMember = Object.values(workloadAnalysis).find(m => m.activeTasks > avgTasks * 2);
    
    const bottleneckPrediction = bottleneckedMember ? 
        `${bottleneckedMember.name} (${bottleneckedMember.activeTasks} tasks)` : 
        'None detected';
    
    // REAL Math: Resource need assessment
    let resourceNeed = 'Adequate';
    if (daysToComplete > 60 && currentVelocity > 0) {
        resourceNeed = 'Additional resources needed';
    } else if (activeTasks.length === 0) {
        resourceNeed = 'Capacity available';
    } else if (bottleneckedMember) {
        resourceNeed = 'Redistribute workload';
    }

    return {
        quarterlyForecast,
        deliveryPrediction: Math.round(Math.min(95, completionRate)),
        riskAdjustedTimeline,
        confidenceLevel,
        bottleneckPrediction,
        resourceNeed,
        // Additional real metrics
        currentVelocity: Math.round(currentVelocity * 10) / 10,
        daysToComplete: Math.round(daysToComplete),
        last30DaysCompleted: recentlyCompleted.length,
        currentBacklog: activeTasks.length
    };
};

const calculateExecutiveSummary = (contents, workspaceMembers, dateRange = null) => {
    // Filter tasks by date range if provided
    let filteredContents = contents;
    if (dateRange && dateRange.start && dateRange.end) {
        const startDate = new Date(dateRange.start);
        const endDate = new Date(dateRange.end);
        filteredContents = contents.filter(task => {
            const taskDate = new Date(task.updatedAt);
            return taskDate >= startDate && taskDate <= endDate;
        });
    }

    const capacity = calculateCapacityIntelligence(filteredContents, workspaceMembers, dateRange);
    const risk = calculateRiskAssessment(filteredContents, workspaceMembers, dateRange);
    const benchmarking = calculatePerformanceBenchmarking(filteredContents, workspaceMembers, dateRange);
    const forecasting = calculatePredictiveForecasting(filteredContents, workspaceMembers, dateRange);
    
    // Generate executive insights
    const keyMetrics = {
        workspaceHealth: Math.round((capacity.efficiencyScore + risk.projectHealthScore) / 2),
        performanceRank: benchmarking.efficiencyRank,
        deliveryConfidence: forecasting.deliveryPrediction,
        quarterlyOutlook: forecasting.quarterlyForecast
    };
    
    // Critical alerts
    const alerts = [];
    if (risk.projectHealthScore < 70) {
        alerts.push('High project risk detected');
    }
    if (capacity.utilizationRate > 90) {
        alerts.push('Workspace capacity overload');
    }
    if (benchmarking.overallScore < 80) {
        alerts.push('Below industry performance');
    }
    
    // Strategic recommendations
    const strategicActions = [];
    if (forecasting.confidenceLevel === 'Low') {
        strategicActions.push('Immediate risk mitigation required');
    }
    if (benchmarking.overallScore >= 100) {
        strategicActions.push('Consider expanding workspace capacity');
    }
    if (alerts.length === 0) {
        strategicActions.push('Maintain current excellence');
    }
    
    return {
        keyMetrics,
        alerts,
        strategicActions,
        summary: `Workspace performing at ${benchmarking.efficiencyRank} level with ${forecasting.deliveryPrediction}% delivery confidence. ${forecasting.quarterlyForecast} tasks forecasted for Q4.`
    };
};

const calculateCapacityIntelligence = (contents, workspaceMembers, dateRange = null) => {
    // Filter tasks by date range if provided
    let filteredContents = contents;
    if (dateRange && dateRange.start && dateRange.end) {
        const startDate = new Date(dateRange.start);
        const endDate = new Date(dateRange.end);
        filteredContents = contents.filter(task => {
            const taskDate = new Date(task.updatedAt);
            return taskDate >= startDate && taskDate <= endDate;
        });
    }

    if (!filteredContents.length || !workspaceMembers.length) return {
        overallCapacity: 0,
        utilizationRate: 0,
        suggestedRebalancing: [],
        efficiencyScore: 0
    };

    // Real workload calculation - NO ESTIMATION
    const memberWorkload = {};
    workspaceMembers.forEach(member => {
        memberWorkload[member.id] = {
            name: member.name,
            activeTasks: 0,
            overdueTasks: 0,
            urgentTasks: 0,
            tasksList: []
        };
    });

    // Real task counting - NO HOUR ESTIMATION
    filteredContents.forEach(task => {
        if (memberWorkload[task.assignee.id] && !['published', 'done', 'completed', 'selesai', 'closed'].includes(task.status)) {
            memberWorkload[task.assignee.id].activeTasks++;
            memberWorkload[task.assignee.id].tasksList.push({
                id: task.id,
                title: task.title,
                priority: task.priority,
                dueDate: task.dueDate
            });
            
            // Check if overdue
            if (new Date(task.dueDate) < new Date()) {
                memberWorkload[task.assignee.id].overdueTasks++;
            }
            
            // Check if urgent
            if (task.priority === 'urgent' || task.priority === 'high') {
                memberWorkload[task.assignee.id].urgentTasks++;
            }
        }
    });

    // Real math calculations - NO BULLSHIT
    const members = Object.values(memberWorkload);
    const taskCounts = members.map(m => m.activeTasks);
    const overdueCounts = members.map(m => m.overdueTasks);

    // Basic statistics
    const totalActiveTasks = taskCounts.reduce((sum, count) => sum + count, 0);
    const totalOverdueTasks = overdueCounts.reduce((sum, count) => sum + count, 0);
    const avgTasksPerPerson = totalActiveTasks / Math.max(1, members.length);
    const maxTasksOnePerson = Math.max(...taskCounts);
    const minTasksOnePerson = Math.min(...taskCounts);

    // Real workload analysis
    const overloadedMembers = members.filter(m => m.activeTasks > avgTasksPerPerson * 1.5);
    const underloadedMembers = members.filter(m => m.activeTasks < avgTasksPerPerson * 0.5);

    // Generate REAL suggestions based on math
    const suggestedRebalancing = [];
    if (maxTasksOnePerson > avgTasksPerPerson * 2) {
        const overloadedMember = members.find(m => m.activeTasks === maxTasksOnePerson);
        const lightestMember = members.find(m => m.activeTasks === minTasksOnePerson);
        
        suggestedRebalancing.push({
            action: 'redistribute',
            from: overloadedMember.name,
            to: lightestMember.name,
            reason: `${overloadedMember.name} has ${maxTasksOnePerson} tasks, ${lightestMember.name} has ${minTasksOnePerson}`
        });
    }

    // Distribution score based on standard deviation
    const variance = taskCounts.reduce((sum, count) => sum + Math.pow(count - avgTasksPerPerson, 2), 0) / taskCounts.length;
    const standardDeviation = Math.sqrt(variance);
    const distributionScore = Math.max(0, 100 - (standardDeviation * 20)); // Lower deviation = better score

    return {
        // Real metrics
        totalActiveTasks,
        totalOverdueTasks,
        avgTasksPerPerson: Math.round(avgTasksPerPerson * 10) / 10,
        maxTasksOnePerson,
        minTasksOnePerson,
        
        // Analysis
        overloadedMembers: overloadedMembers.map(m => ({ name: m.name, tasks: m.activeTasks })),
        underloadedMembers: underloadedMembers.map(m => ({ name: m.name, tasks: m.activeTasks })),
        chartData: [minTasksOnePerson, avgTasksPerPerson, maxTasksOnePerson],
        
        // Suggestions
        suggestedRebalancing,
        distributionScore: Math.round(distributionScore),
        
        // For backward compatibility (so UI doesn't break)
        overallCapacity: Math.round(distributionScore), // Repurpose as distribution quality
        utilizationRate: Math.round(distributionScore),
        efficiencyScore: Math.round(distributionScore),
        memberDetails: members.map(member => ({
            name: member.name,
            maxCapacity: 100, // Dummy for UI compatibility
            currentLoad: member.activeTasks,
            efficiency: member.activeTasks > 0 ? Math.min(100, (member.activeTasks / Math.max(1, avgTasksPerPerson)) * 50) : 0,
            utilizationRate: member.activeTasks > 0 ? Math.min(100, (member.activeTasks / Math.max(1, maxTasksOnePerson)) * 100) : 0
        }))
    };
};

const calculateRiskAssessment = (contents, workspaceMembers, dateRange = null) => {
    // Filter tasks by date range if provided
    let filteredContents = contents;
    if (dateRange && dateRange.start && dateRange.end) {
        const startDate = new Date(dateRange.start);
        const endDate = new Date(dateRange.end);
        filteredContents = contents.filter(task => {
            const taskDate = new Date(task.updatedAt);
            return taskDate >= startDate && taskDate <= endDate;
        });
    }

    if (!filteredContents.length) return {
        projectHealthScore: 100,
        riskFactors: [],
        deliveryProbability: 95,
        budgetVariance: 0
    };

    const now = new Date();
    const riskFactors = [];
    
    // 1. REAL Math: Overdue Analysis
    const overdueTasks = filteredContents.filter(task => {
        const dueDate = new Date(task.dueDate);
        return dueDate < now && !['published', 'done', 'completed', 'selesai', 'closed'].includes(task.status);
    });
    
    const overdueByPriority = {
        urgent: overdueTasks.filter(t => t.priority === 'urgent').length,
        high: overdueTasks.filter(t => t.priority === 'high').length,
        medium: overdueTasks.filter(t => t.priority === 'medium').length,
        low: overdueTasks.filter(t => t.priority === 'low').length
    };
    
    if (overdueTasks.length > 0) {
        const avgDaysOverdue = overdueTasks.reduce((sum, task) => {
            const days = Math.ceil((now - new Date(task.dueDate)) / (1000 * 60 * 60 * 24));
            return sum + days;
        }, 0) / overdueTasks.length;
        
        riskFactors.push({
            type: 'overdue_tasks',
            severity: overdueByPriority.urgent > 0 ? 'critical' : overdueByPriority.high > 0 ? 'high' : 'medium',
            count: overdueTasks.length,
            message: `${overdueTasks.length} overdue tasks (avg ${Math.round(avgDaysOverdue)} days late)`,
            details: overdueByPriority
        });
    }
    
    // 2. REAL Math: Workload Distribution Risk
    const activeTasks = filteredContents.filter(task => 
        !['published', 'done', 'completed', 'selesai', 'closed'].includes(task.status)
    );
    
    const workloadPerPerson = {};
    workspaceMembers.forEach(member => {
        workloadPerPerson[member.id] = 0;
    });
    
    activeTasks.forEach(task => {
        if (workloadPerPerson[task.assignee.id] !== undefined) {
            workloadPerPerson[task.assignee.id]++;
        }
    });
    
    const taskCounts = Object.values(workloadPerPerson);
    const avgTasks = taskCounts.reduce((sum, count) => sum + count, 0) / taskCounts.length;
    const maxTasks = Math.max(...taskCounts);
    
    if (maxTasks > avgTasks * 2.5) {
        const overloadedMember = workspaceMembers.find(member => 
            workloadPerPerson[member.id] === maxTasks
        );
        
        riskFactors.push({
            type: 'workload_imbalance',
            severity: 'high',
            count: maxTasks,
            message: `${overloadedMember?.name} has ${maxTasks} tasks (workspace avg: ${avgTasks.toFixed(1)})`,
            details: { member: overloadedMember?.name, tasks: maxTasks, average: avgTasks }
        });
    }
    
    // 3. REAL Math: Stuck Tasks Analysis
    const stuckTasks = filteredContents.filter(task => {
        const daysSinceUpdate = (now - new Date(task.updatedAt)) / (1000 * 60 * 60 * 24);
        return daysSinceUpdate > 7 && !['published', 'done', 'completed', 'selesai', 'closed'].includes(task.status);
    });
    
    if (stuckTasks.length > 0) {
        const avgDaysStuck = stuckTasks.reduce((sum, task) => {
            const days = (now - new Date(task.updatedAt)) / (1000 * 60 * 60 * 24);
            return sum + days;
        }, 0) / stuckTasks.length;
        
        riskFactors.push({
            type: 'stuck_tasks',
            severity: avgDaysStuck > 14 ? 'high' : 'medium',
            count: stuckTasks.length,
            message: `${stuckTasks.length} tasks inactive >7 days (avg ${Math.round(avgDaysStuck)} days)`,
            details: { avgDaysStuck: Math.round(avgDaysStuck) }
        });
    }
    
    // 4. REAL Math: High Priority Concentration
    const urgentTasks = activeTasks.filter(task => task.priority === 'urgent' || task.priority === 'high');
    const urgentRatio = urgentTasks.length / Math.max(1, activeTasks.length);
    
    if (urgentRatio > 0.4) {
        riskFactors.push({
            type: 'priority_overload',
            severity: urgentRatio > 0.6 ? 'high' : 'medium',
            count: urgentTasks.length,
            message: `${Math.round(urgentRatio * 100)}% of active tasks are high/urgent priority`,
            details: { ratio: urgentRatio, total: urgentTasks.length }
        });
    }
    
    // Calculate health score based on real factors
    let healthScore = 100;
    
    riskFactors.forEach(risk => {
        const impact = {
            'critical': 30,
            'high': 20,
            'medium': 10,
            'low': 5
        };
        healthScore -= impact[risk.severity] || 10;
    });
    
    healthScore = Math.max(0, healthScore);
    
    // Calculate delivery probability based on current performance
    const completionRate = filteredContents.length > 0 ? 
        filteredContents.filter(task => ['published', 'done', 'completed', 'selesai', 'closed'].includes(task.status)).length / filteredContents.length : 1;
    
    const deliveryProbability = Math.round(completionRate * healthScore);

    return {
        projectHealthScore: Math.round(healthScore),
        riskFactors,
        deliveryProbability: Math.max(10, deliveryProbability),
        budgetVariance: riskFactors.length > 0 ? riskFactors.length * -5 : 2,
        chartData: [Math.max(10, deliveryProbability), Math.round(healthScore)],
    };
};

// Client Create/Edit Form Component
const ClientForm = ({ onSubmit, onCancel, editingClient, currentWorkspace }) => {
    const [formData, setFormData] = useState(() => {
        if (editingClient) {
            return {
                customer_type: editingClient.customerType || 'personal',
                name: editingClient.name || '',
                phone_number: editingClient.phoneNumber || '',
                email: editingClient.email || '',
                address: editingClient.address || '',
                platform: editingClient.platform || '',
                industry: editingClient.industry || '',
                joined_date: editingClient.joinedDate || '',
                status: editingClient.status || 'active',
                contract_type: editingClient.contractType || 'one-off',
                client_stage: editingClient.clientStage || 'prospect',
            };
        }
        
        return {
            customer_type: 'personal',
            name: '',
            phone_number: '',
            email: '',
            address: '',
            platform: '',
            industry: '',
            joined_date: '',
            status: 'active',
            contract_type: 'one-off',
            client_stage: 'prospect',
        };
    });

    const [errors, setErrors] = useState({});

    const industryOptions = [
        'Technology', 'Finance', 'Healthcare', 'Retail', 'Education',
        'Food & Beverage', 'Real Estate', 'Automotive', 'Media',
        'Consulting', 'Manufacturing', 'Other'
    ];

    const validateForm = () => {
        const newErrors = {};
        
        if (!formData.name?.trim()) newErrors.name = "Name is required";
        if (!formData.phone_number?.trim()) newErrors.phone_number = "Phone number is required";
        if (!formData.email?.trim()) newErrors.email = "Email is required";
        if (!formData.address?.trim()) newErrors.address = "Address is required";
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validateForm()) {
            const submitData = {
                ...formData,
                workspace_id: currentWorkspace.id,
            };
            
            if (editingClient) {
                onSubmit({ ...submitData, id: editingClient.id });
            } else {
                onSubmit(submitData);
            }
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {/* Customer Type */}
            <div>
                <label className="block text-sm font-medium text-t-mut mb-2">Customer Type</label>
                <div className="grid grid-cols-2 gap-3">
                    <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, customer_type: 'personal' }))}
                        className={`p-3 rounded-xl border-2 transition-colors ${
                            formData.customer_type === 'personal'
                                ? 'border-b-blue bg-b-blue/10 text-t-light'
                                : 'border-bor bg-b-darklight text-t-mut hover:border-b-blue'
                        }`}
                    >
                        <User className="w-5 h-5 mx-auto mb-1" />
                        <div className="text-sm font-medium">Personal</div>
                    </button>
                    <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, customer_type: 'business' }))}
                        className={`p-3 rounded-xl border-2 transition-colors ${
                            formData.customer_type === 'business'
                                ? 'border-b-blue bg-b-blue/10 text-t-light'
                                : 'border-bor bg-b-darklight text-t-mut hover:border-b-blue'
                        }`}
                    >
                        <Briefcase className="w-5 h-5 mx-auto mb-1" />
                        <div className="text-sm font-medium">Business</div>
                    </button>
                </div>
            </div>

            {/* Client Stage */}
            <div>
                <label className="block text-sm font-medium text-t-mut mb-2">Client Stage</label>
                <div className="grid grid-cols-2 gap-3">
                    <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, client_stage: 'prospect' }))}
                        className={`p-4 rounded-2xl border-2 transition-colors flex flex-col items-center justify-center space-y-2 ${
                            formData.client_stage === 'prospect'
                                ? 'border-b-blue bg-b-blue/10 text-t-light'
                                : 'border-bor bg-b-darklight text-t-mut hover:border-b-blue hover:bg-b-blue/5'
                        }`}
                    >
                        <div className="w-8 h-8 bg-b-blue/20 rounded-lg flex items-center justify-center">
                            <Target className="w-4 h-4 text-t-blue" />
                        </div>
                        <div className="text-center">
                            <div className="text-sm font-semibold">Prospect</div>
                            <div className="text-xs opacity-75">Potential client</div>
                        </div>
                    </button>
                    
                    <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, client_stage: 'client' }))}
                        className={`p-4 rounded-2xl border-2 transition-colors flex flex-col items-center justify-center space-y-2 ${
                            formData.client_stage === 'client'
                                ? 'border-b-grn bg-b-grn/10 text-t-light'
                                : 'border-bor bg-b-darklight text-t-mut hover:border-b-grn hover:bg-b-grn/5'
                        }`}
                    >
                        <div className="w-8 h-8 bg-b-grn/20 rounded-lg flex items-center justify-center">
                            <CheckCircle2 className="w-4 h-4 text-t-grn" />
                        </div>
                        <div className="text-center">
                            <div className="text-sm font-semibold">Client</div>
                            <div className="text-xs opacity-75">Active client</div>
                        </div>
                    </button>
                </div>
            </div>

            {/* Required Fields */}
            <Input
                label="Name"
                placeholder={formData.customer_type === 'personal' ? "John Doe" : "PT. Example Company"}
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                error={errors.name}
                required
            />

            <div className="grid grid-cols-2 gap-3">
                <Input
                    label="Phone Number"
                    placeholder="+62 812 3456 7890"
                    value={formData.phone_number}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone_number: e.target.value }))}
                    error={errors.phone_number}
                    required
                />
                <Input
                    label="Email"
                    type="email"
                    placeholder="contact@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    error={errors.email}
                    required
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-t-mut mb-1">Address</label>
                <textarea
                    value={formData.address}
                    onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                    rows={3}
                    className="w-full px-4 py-3 text-base bg-b-darklight text-t-light rounded-lg focus:ring-1 focus:ring-bor-grn resize-none"
                    placeholder="Complete address..."
                    required
                />
                {errors.address && (
                    <p className="mt-1 text-sm text-t-red">{errors.address}</p>
                )}
            </div>

            {/* Optional Fields */}
            <div className="grid grid-cols-2 gap-3">
                <Input
                    label="Platform"
                    placeholder="Website, Instagram, etc."
                    value={formData.platform}
                    onChange={(e) => setFormData(prev => ({ ...prev, platform: e.target.value }))}
                />
                <div>
                    <label className="block text-sm font-medium text-t-mut mb-1">Industry</label>
                    <Dropdown
                        options={industryOptions.map(industry => ({
                            value: industry.toLowerCase(),
                            label: industry,
                            icon: Briefcase
                        }))}
                        value={formData.industry}
                        onChange={(value) => setFormData(prev => ({ ...prev, industry: value }))}
                        placeholder="Select industry..."
                        enableHover={false}
                    />
                </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
                <DatePicker
                    label="Joined Date"
                    value={formData.joined_date}
                    onChange={(value) => setFormData(prev => ({ ...prev, joined_date: value }))}
                />
                <div>
                    <label className="block text-sm font-medium text-t-mut mb-1">Status</label>
                    <Dropdown
                        options={[
                            { value: 'active', label: 'Active', icon: CheckCircle2 },
                            { value: 'inactive', label: 'Inactive', icon: Circle },
                            { value: 'churned', label: 'Churned', icon: X }
                        ]}
                        value={formData.status}
                        onChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
                        enableHover={false}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-t-mut mb-1">Contract</label>
                    <Dropdown
                        options={[
                            { value: 'one-off', label: 'One-off', icon: Zap },
                            { value: 'ongoing', label: 'Ongoing', icon: RefreshCw }
                        ]}
                        value={formData.contract_type}
                        onChange={(value) => setFormData(prev => ({ ...prev, contract_type: value }))}
                        enableHover={false}
                    />
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3 pt-4">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-4 py-2 bg-b-darklight hover:bg-b-semidark text-t-light rounded-lg transition-colors"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-b-blue hover:bg-blue-600 text-t-light rounded-lg transition-colors"
                >
                    {editingClient ? 'Update Client' : 'Add Client'}
                </button>
            </div>
        </form>
    );
};

// Main App Component
const ContentPlanner = () => {
    // Core State
    const [activeView, setActiveView] = useLocalStorage(
        "activeView",
        "dashboard"
    );
    const [sidebarCollapsed, setSidebarCollapsed] = useLocalStorage(
        "sidebarCollapsed",
        true
    );
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedChannel, setSelectedChannel] = useLocalStorage("selectedChannel", "all");

    const [workspaces, setWorkspaces] = useState([]);
    const [currentWorkspace, setCurrentWorkspace] = useState(null);
    const [workspaceMembers, setWorkspaceMembers] = useState([]);
    const [isWorkspaceModalOpen, setIsWorkspaceModalOpen] = useState(false);
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
    const [loadingWorkspaces, setLoadingWorkspaces] = useState(false);

    const [showInvitationLink, setShowInvitationLink] = useState(false);
    const [invitationResponse, setInvitationResponse] = useState(null);

    const [selectedStatus, setSelectedStatus] = useLocalStorage("selectedStatus", "all");
    const [selectedCategory, setSelectedCategory] = useLocalStorage("selectedCategory", "all");
    const [selectedPriority, setSelectedPriority] = useLocalStorage("selectedPriority", "all");

    const [viewMode, setViewMode] = useLocalStorage("viewMode", "grid");
    const [sortBy, setSortBy] = useState("updatedAt");
    const [sortOrder, setSortOrder] = useState("desc");

    const [currentDate, setCurrentDate] = useState(() => new Date());
    const [selectedDate, setSelectedDate] = useState(() => new Date());
    const [calendarView, setCalendarView] = useState("month");
    const [hoveredDate, setHoveredDate] = useState(null);
    const [isCalendarCollapsed, setIsCalendarCollapsed] = useState(false);

    const [calendarFilter, setCalendarFilter] = useState('all');
    const [contentTargetFilter, setContentTargetFilter] = useState('all');

    const [holidays, setHolidays] = useState([]);
    const [loadingHolidays, setLoadingHolidays] = useState(false);

    // Modal States
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
    const [isShortcutsModalOpen, setIsShortcutsModalOpen] = useState(false);
    const [isCreatePanelOpen, setIsCreatePanelOpen] = useState(false);
    const [panelContent, setPanelContent] = useState('recent-activity');
    const [editingTask, setEditingTask] = useState(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const [isViewMode, setIsViewMode] = useState(false);
    const [viewingTask, setViewingTask] = useState(null);

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [taskToDelete, setTaskToDelete] = useState(null);

    // UI States
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loadingNotifications, setLoadingNotifications] = useState(false);

    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const [activeProfileCard, setActiveProfileCard] = useState('workspace');

    const [clients, setClients] = useState([]);
    const [loadingClients, setLoadingClients] = useState(false);
    const [isClientModalOpen, setIsClientModalOpen] = useState(false);
    const [editingClient, setEditingClient] = useState(null);

    const [clientFormMode, setClientFormMode] = useState('list');
    const [expandedClientId, setExpandedClientId] = useState(null);

    const [editingClientName, setEditingClientName] = useState(null); // ID client yang sedang diedit
    const [editNameValue, setEditNameValue] = useState('');

    // Refs
    const searchRef = useRef(null);
    const notificationRef = useRef(null);
    const recentActivityRef = useRef(null);

    // Toast System
    const { toasts, addToast, removeToast } = useToast();

    // Debounced Search
    const debouncedSearchQuery = useDebounce(searchQuery, 300);

    const [contents, setContents] = useState([]);
    const [allTasks, setAllTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [expandedAnalytic, setExpandedAnalytic] = useState(null);
    const [hasScroll, setHasScroll] = useState(false);
    const navigationRef = useRef(null);
    const [tooltipData, setTooltipData] = useState({ visible: false, text: '', x: 0, y: 0 });

    const [analyticsTimeframe, setAnalyticsTimeframe] = useState('30d'); // 7d, 30d, 90d, custom
    const [customDateRange, setCustomDateRange] = useState({ start: null, end: null });
    const [showComparative, setShowComparative] = useState(false);
    const [compareWithPeriod, setCompareWithPeriod] = useState('previous');

    const [isAnalyticsStackExpanded, setIsAnalyticsStackExpanded] = useState(false);

    // ✅ HELPER FUNCTION UNTUK TRIGGER EVENT - STABLE
    const triggerTaskDetail = useCallback((task) => {
        const event = new CustomEvent('show-task-detail', {
            detail: task
        });
        document.dispatchEvent(event);
    }, []); // Empty dependency array = stable function

    useEffect(() => {
        const loadTasks = async () => {
            try {
                setLoading(true);
                setError(null);
                
                const filters = {
                    category: selectedCategory,
                    status: selectedStatus,
                    channel: selectedChannel,
                    priority: selectedPriority,
                    search: debouncedSearchQuery,
                    sortBy: sortBy,
                    sortOrder: sortOrder,
                    workspace_id: currentWorkspace?.id, // Filter by current workspace
                };
                
                const tasks = await api.fetchTasks(filters);
                setContents(tasks);
            } catch (err) {
                setError(err.message);
                addToast('Failed to load tasks', 'error');
            } finally {
                setLoading(false);
            }
        };

        loadTasks();
    }, [
        selectedCategory,
        selectedStatus, 
        selectedChannel,
        selectedPriority,
        debouncedSearchQuery,
        sortBy,
        sortOrder,
        currentWorkspace?.id, // Re-load tasks when workspace changes
    ]);

    // Load stats on component mount - UPDATED WITH TEAM FILTER
    useEffect(() => {
        const loadStats = async () => {
            try {
                const filters = currentWorkspace?.id ? { workspace_id: currentWorkspace.id } : {};
                const stats = await api.fetchStats(filters);
                setContentStats(stats);
            } catch (err) {
                console.error('Failed to load stats:', err);
                // Don't show toast error for stats, just console log
            }
        };

        loadStats();
    }, [contents, currentWorkspace?.id]); // IMPORTANT: Added currentWorkspace?.id dependency

    // Fetch all tasks for analytics
    useEffect(() => {
        const loadAllTasks = async () => {
            const filters = { workspace_id: currentWorkspace?.id }; // NO category filter
            const tasks = await api.fetchTasks(filters);
            setAllTasks(tasks);
        };
        if (currentWorkspace?.id) loadAllTasks();
    }, [currentWorkspace?.id]); // NO selectedCategory dependency

    // Load workspaces on component mount
    useEffect(() => {
        const loadWorkspaces = async () => {
            try {
                setLoadingWorkspaces(true);
                
                // ✅ TAMBAH: Check for Laravel flash messages
                const urlParams = new URLSearchParams(window.location.search);
                const flashMessage = urlParams.get('message');
                const flashType = urlParams.get('type');
                
                if (flashMessage) {
                    addToast(decodeURIComponent(flashMessage), flashType || 'info');
                    // Clear URL parameters without page reload
                    window.history.replaceState({}, document.title, window.location.pathname);
                }
                
                const workspacesData = await workspaceApi.fetchWorkspaces();
                setWorkspaces(workspacesData);
                
                // Set current workspace (first workspace as default)
                if (workspacesData.length > 0 && !currentWorkspace) {
                    const firstWorkspace = workspacesData[0];
                    setCurrentWorkspace(firstWorkspace);
                    
                    // Load workspace members
                    const members = await workspaceApi.getWorkspaceMembers(firstWorkspace.id);
                    setWorkspaceMembers(members);
                }
            } catch (error) {
                console.error('Failed to load workspaces:', error);
                addToast('Failed to load workspaces', 'error');
            } finally {
                setLoadingWorkspaces(false);
            }
        };

        loadWorkspaces();
        
        // ✅ TAMBAH: Listen for storage events (multi-tab sync)
        const handleStorageChange = () => {
            loadWorkspaces();
        };
        
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    // Load clients when workspace changes
    useEffect(() => {
        const loadClients = async () => {
            if (!currentWorkspace?.id) return;
            
            try {
                setLoadingClients(true);
                const clientsData = await clientApi.fetchClients(currentWorkspace.id);
                setClients(clientsData);
                window.ContentPlannerClients = clientsData;
            } catch (error) {
                console.error('Failed to load clients:', error);
            } finally {
                setLoadingClients(false);
            }
        };

        loadClients();
    }, [currentWorkspace?.id]);

    // Load notifications on component mount
    useEffect(() => {
        const loadNotifications = async () => {
            try {
                const [notificationsData, countData] = await Promise.all([
                    api.fetchNotifications(),
                    api.fetchUnreadCount()
                ]);
                setNotifications(notificationsData);
                setUnreadCount(countData.count);
            } catch (error) {
                console.error('Failed to load notifications:', error);
            }
        };

        loadNotifications();

        // Poll ONLY unread count, not full notifications
        const interval = setInterval(async () => {
            try {
                const countData = await api.fetchUnreadCount();
                setUnreadCount(countData.count);
                // DON'T update notifications array to prevent re-render
            } catch (error) {
                console.error('Failed to refresh notification count:', error);
            }
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const refreshWorkspaces = async () => {
            // Only refresh if we have flash message indicating workspace join
            const urlParams = new URLSearchParams(window.location.search);
            const flashMessage = urlParams.get('message');
            
            if (flashMessage && flashMessage.includes('joined workspace')) {
                try {
                    const workspacesData = await workspaceApi.fetchWorkspaces();
                    setWorkspaces(workspacesData);
                    
                    // Auto-select the newest workspace (last in array)
                    if (workspacesData.length > 0) {
                        const newestWorkspace = workspacesData[workspacesData.length - 1];
                        setCurrentWorkspace(newestWorkspace);
                        
                        // Load its members
                        const members = await workspaceApi.getWorkspaceMembers(newestWorkspace.id);
                        setWorkspaceMembers(members);
                    }
                } catch (error) {
                    console.error('Failed to refresh workspaces after join:', error);
                }
            }
        };

        refreshWorkspaces();
    }, [window.location.search]); // Re-run when URL changes

    useEffect(() => {
        const handleTaskDetailEvent = (event) => {
            const task = event.detail;
            setViewingTask(task);
            setIsViewMode(true);
            setIsEditMode(false);
            setEditingTask(null);
            setIsCreatePanelOpen(true);
            setPanelContent('view');
        };

        document.addEventListener('show-task-detail', handleTaskDetailEvent);
        
        return () => {
            document.removeEventListener('show-task-detail', handleTaskDetailEvent);
        };
    }, []);

    useEffect(() => {
        if (!isAnalyticsStackExpanded) {
            setExpandedAnalytic(null); // Close all accordions when stack collapses
        }
    }, [isAnalyticsStackExpanded]);

    useEffect(() => {
        const checkScroll = () => {
            if (navigationRef.current) {
                const hasScrollbar = navigationRef.current.scrollHeight > navigationRef.current.clientHeight;
                setHasScroll(hasScrollbar);
            }
        };

        // Check on mount and resize
        checkScroll();
        window.addEventListener('resize', checkScroll);
        
        // Check when content changes
        const observer = new MutationObserver(checkScroll);
        if (navigationRef.current) {
            observer.observe(navigationRef.current, { childList: true, subtree: true });
        }

        return () => {
            window.removeEventListener('resize', checkScroll);
            observer.disconnect();
        };
    }, [workspaceMembers, activeView, selectedCategory]);

    const refreshNotifications = useCallback(async () => {
        try {
            const [notificationsData, countData] = await Promise.all([
                api.fetchNotifications(),
                api.fetchUnreadCount()
            ]);
            setNotifications(notificationsData);
            setUnreadCount(countData.count);
        } catch (error) {
            console.error('Failed to refresh notifications:', error);
        }
    }, []);

    // Mini Line Chart Component - Apple Style
    const MiniLineChart = ({ data, color = "text-t-grn", height = 30, width = 80 }) => {
        if (!data || data.length < 2) return null;
        
        const max = Math.max(...data);
        const min = Math.min(...data);
        const range = max - min || 1;
        
        const points = data.map((value, index) => {
            const x = (index / (data.length - 1)) * width;
            const y = height - ((value - min) / range) * height;
            return `${x},${y}`;
        }).join(' ');
        
        return (
            <svg width={width} height={height} className="overflow-visible">
                <polyline
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={points}
                    className={`${color} opacity-60`}
                />
                {data.map((value, index) => {
                    const x = (index / (data.length - 1)) * width;
                    const y = height - ((value - min) / range) * height;
                    return (
                        <circle
                            key={index}
                            cx={x}
                            cy={y}
                            r="1.5"
                            fill="currentColor"
                            className={`${color} ${index === data.length - 1 ? 'opacity-100' : 'opacity-40'}`}
                        />
                    );
                })}
            </svg>
        );
    };

    // Enhanced Channel Configuration
    const channels = useMemo(
        () => [
            {
                id: "all",
                name: "All Channels",
                icon: Hash,
                color: "from-gray-500 to-gray-600",
                count: contents.length,
                description: "All content across platforms",
            },
            {
                id: "instagram",
                name: "Instagram",
                icon: Image,
                color: "from-pink-500 to-rose-500",
                count: contents.filter((c) => c.channel === "instagram").length,
                description: "Visual content and stories",
            },
            {
                id: "youtube",
                name: "YouTube",
                icon: Video,
                color: "from-red-500 to-red-600",
                count: contents.filter((c) => c.channel === "youtube").length,
                description: "Video content and tutorials",
            },
            {
                id: "email",
                name: "Email",
                icon: FileText,
                color: "from-blue-500 to-blue-600",
                count: contents.filter((c) => c.channel === "email").length,
                description: "Newsletters and campaigns",
            },
            {
                id: "podcast",
                name: "Podcast",
                icon: Mic,
                color: "from-purple-500 to-purple-600",
                count: contents.filter((c) => c.channel === "podcast").length,
                description: "Audio content and interviews",
            },
            {
                id: "internal",
                name: "Internal",
                icon: Folder,
                color: "from-orange-500 to-orange-600",
                count: contents.filter((c) => c.channel === "internal").length,
                description: "Internal documentation",
            },
        ],
        [contents]
    );

    const filteredContents = useMemo(() => {
        let filtered = contents.filter((content) => {
            const matchesSearch =
                content.title?.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
                (content.description && content.description.toLowerCase().includes(debouncedSearchQuery.toLowerCase())) ||
                (content.notes && content.notes.toLowerCase().includes(debouncedSearchQuery.toLowerCase())) ||
                content.tags?.some((tag) =>
                    tag.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
                ) ||
                content.assignee?.name?.toLowerCase().includes(debouncedSearchQuery.toLowerCase());
                
            const matchesCategory = selectedCategory === "all" || content.category === selectedCategory;
            const matchesChannel = selectedChannel === "all" || content.channel === selectedChannel;
            let matchesStatus = true;
            if (selectedStatus !== "all") {
                if (selectedStatus === "active") {
                    matchesStatus = isActiveTask(content);
                } else if (selectedStatus === "not-started") {
                    matchesStatus = STATUS_MAPPING.NOT_STARTED.includes(content.status);
                } else if (selectedStatus === "in-progress") {
                    matchesStatus = STATUS_MAPPING.IN_PROGRESS.includes(content.status);
                } else if (selectedStatus === "scheduled") {
                    matchesStatus = STATUS_MAPPING.SCHEDULED.includes(content.status);
                } else if (selectedStatus === "completed") {
                    matchesStatus = STATUS_MAPPING.COMPLETED.includes(content.status);
                } else {
                    matchesStatus = content.status === selectedStatus;
                }
            }
            const matchesPriority = selectedPriority === "all" || content.priority === selectedPriority;

            return matchesSearch && matchesCategory && matchesChannel && matchesStatus && matchesPriority;
        });

        // IMPROVED SORT LOGIC
        filtered.sort((a, b) => {
            let aValue, bValue;

            switch (sortBy) {
                case "assignee":
                    aValue = a.assignee.name;
                    bValue = b.assignee.name;
                    break;
                case "category":
                    aValue = a.category;
                    bValue = b.category;
                    break;
                case "priority":
                    // Custom priority sorting: urgent > high > medium > low
                    const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
                    aValue = priorityOrder[a.priority] || 0;
                    bValue = priorityOrder[b.priority] || 0;
                    break;
                case "status":
                    aValue = a.status;
                    bValue = b.status;
                    break;
                case "dueDate":
                case "createdAt":
                case "updatedAt":
                    aValue = new Date(a[sortBy]);
                    bValue = new Date(b[sortBy]);
                    break;
                case "title":
                default:
                    aValue = a[sortBy] || a.title;
                    bValue = b[sortBy] || b.title;
                    break;
            }

            // Handle different data types
            if (typeof aValue === "string" && typeof bValue === "string") {
                return sortOrder === "asc" 
                    ? aValue.localeCompare(bValue)
                    : bValue.localeCompare(aValue);
            }

            if (aValue instanceof Date && bValue instanceof Date) {
                return sortOrder === "asc" 
                    ? aValue - bValue 
                    : bValue - aValue;
            }

            // For numbers (like priority)
            return sortOrder === "asc" 
                ? aValue - bValue 
                : bValue - aValue;
        });

        return filtered;
    }, [
        contents,
        debouncedSearchQuery,
        selectedCategory,
        selectedChannel,
        selectedStatus,
        selectedPriority,
        sortBy,
        sortOrder,
    ]);

    const [contentStats, setContentStats] = useState({
        total: 0,
        draft: 0,
        inProgress: 0,
        scheduled: 0,
        published: 0,
        highPriority: 0,
        overdue: 0,
        dueToday: 0,
        totalCollaborators: 0,
        totalAttachments: 0,
    });

    const handleCreateContent = useCallback(
        async (taskData) => {
            try {
                setLoading(true);
                
                if (isEditMode && taskData.id) {
                    // Update existing task
                    const updatedTask = await api.updateTask(taskData.id, taskData);
                    setContents((prev) => prev.map(task => 
                        task.id === taskData.id ? updatedTask : task
                    ));
                    
                    const categoryConfig = TASK_CATEGORIES[taskData.category.toUpperCase()];
                    addToast(`${categoryConfig?.name?.split(' ')[0] || 'Task'} updated successfully!`, "success");

                    // ✅ TAMBAH INI: Switch ke view mode setelah edit
                    setViewingTask(updatedTask);
                    setIsViewMode(true);
                    setIsEditMode(false);
                    setEditingTask(null);
                    setPanelContent('view');

                    if (recentActivityRef.current) {
                        setTimeout(() => {
                            recentActivityRef.current.refresh();
                        }, 500);
                    }
                } else {
                    // Auto-create client dari manual input
                    if (taskData.category === 'sales' && taskData.contact) {
                        // Cek apakah contact sudah ada di client list
                        const existingClient = clients.find(c => c.name.toLowerCase() === taskData.contact.toLowerCase());
                        
                        if (!existingClient) {
                            // Contact belum ada, buat client baru
                            const newClientStage = taskData.dealStage === 'closed' ? 'client' : 'prospect';
                            
                            try {
                                const newClient = await clientApi.createClient({
                                    workspace_id: currentWorkspace.id,
                                    customer_type: 'personal', // Default
                                    name: taskData.contact,
                                    phone_number: '-', // Placeholder
                                    email: `${taskData.contact.toLowerCase().replace(/\s+/g, '')}@temp.com`, // Placeholder
                                    address: '-', // Placeholder
                                    status: 'active',
                                    contract_type: 'one-off',
                                    client_stage: newClientStage
                                });
                                
                                // Update clients state
                                setClients(prev => [...prev, newClient]);
                                
                                // Update window global untuk form content planning
                                window.ContentPlannerClients = [...(window.ContentPlannerClients || []), newClient];
                                
                                addToast(`Contact saved as ${newClientStage}`, 'success');
                            } catch (error) {
                                console.error('Failed to create client:', error);
                                // Continue with task creation even if client creation fails
                            }
                        }
                    }

                    // Create new task
                    const newTask = await api.createTask(taskData);
                    setContents((prev) => [newTask, ...prev]);
                    
                    const categoryConfig = TASK_CATEGORIES[taskData.category.toUpperCase()];
                    addToast(`${categoryConfig?.name?.split(' ')[0] || 'Task'} created successfully!`, "success");

                    setViewingTask(newTask);
                    setIsViewMode(true);
                    setIsEditMode(false);
                    setEditingTask(null);
                    setPanelContent('view');

                    if (recentActivityRef.current) {
                        setTimeout(() => {
                            recentActivityRef.current.refresh();
                        }, 500);
                    }
                }
            } catch (error) {
                addToast(error.message || 'Failed to save task', 'error');
            } finally {
                setLoading(false);
            }
        },
        [addToast, isEditMode]
    );

    const handleDeleteTask = useCallback(
        async (task) => {
            try {
                await api.deleteTask(task.id);
                setContents((prev) => prev.filter((content) => content.id !== task.id));
                addToast("Task deleted successfully", "success");
            } catch (error) {
                addToast(error.message || "Failed to delete task", "error");
            }
        },
        [addToast]
    );

    useKeyboardShortcuts({
        "ctrl+k": () => searchRef.current?.focus(),
        "cmd+k": () => searchRef.current?.focus(),
        "ctrl+n": () => setIsCreatePanelOpen(true),
        "cmd+n": () => setIsCreatePanelOpen(true),
        "ctrl+b": () => setSidebarCollapsed((prev) => !prev),
        "cmd+b": () => setSidebarCollapsed((prev) => !prev),
        "ctrl+/": () => setIsShortcutsModalOpen(true),
        "cmd+/": () => setIsShortcutsModalOpen(true),
        
        // NEW: Navigation shortcuts
        "arrowleft": () => navigate(-1),
        "arrowright": () => navigate(1),
        "ctrl+arrowleft": () => navigateMonth(-1),
        "ctrl+arrowright": () => navigateMonth(1),
        "shift+arrowleft": () => navigateDay(-1),
        "shift+arrowright": () => navigateDay(1),
        "ctrl+t": () => goToToday(),
        "cmd+t": () => goToToday(),
        "ctrl+e": () => setIsCalendarCollapsed(!isCalendarCollapsed),
        "cmd+e": () => setIsCalendarCollapsed(!isCalendarCollapsed),
        
        escape: () => {
            setIsEditMode(false);
            setIsViewMode(false); 
            setEditingTask(null);
            setViewingTask(null);  
            setIsSettingsModalOpen(false);
            setIsShortcutsModalOpen(false);
            setShowNotifications(false);
            setIsMobileMenuOpen(false);
            setPanelContent('recent-activity'); 
        },
    });

    const formatRelativeTime = useCallback((dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));

        if (diffInHours < 1) return "Just now";
        if (diffInHours < 24) return `${diffInHours}h ago`;
        if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;

        return date.toLocaleDateString();
    }, []);

    const getDaysInMonth = (date) => {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (date) => {
        return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    };

    const isToday = (date) => {
        const today = new Date();
        return date.toDateString() === today.toDateString();
    };

    const isSameDate = (date1, date2) => {
        return date1?.toDateString() === date2?.toDateString();
    };

    const getHolidayForDate = (date) => {
        if (!date) return null;        
        const foundHoliday = holidays.find(holiday => 
            holiday.date.toDateString() === date.toDateString()
        );        
        return foundHoliday || null;
    };

    const isIslamicHoliday = (holiday) => {
        if (!holiday) return false;
        const islamicKeywords = [
            'idul', 'eid', 'maulid', 'isra', 'mikraj', 'hijriah', 'muharram', 
            'ramadan', 'syawal', 'haji', 'qurban', 'adha', 'fitr'
        ];
        const summary = holiday.summary.toLowerCase();
        return islamicKeywords.some(keyword => summary.includes(keyword));
    };

    const isHoliday = (date) => {
        const holiday = getHolidayForDate(date);
        return holiday !== null;
    };

    // Calendar Component - WITH GAPS & HOVER POPUP
    const CalendarComponent = React.memo(({ 
        onTaskClick, 
        recentActivityRef,
        calendarFilter,           
        setCalendarFilter,        
        contentTargetFilter,      
        setContentTargetFilter,
        contents,
    }) => {
        const daysInMonth = getDaysInMonth(currentDate);
        const firstDay = getFirstDayOfMonth(currentDate);
        const [hoveredDate, setHoveredDate] = useState(null);
        const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });

        const [isNotesMode, setIsNotesMode] = useState(false);
        const [showNotesPopup, setShowNotesPopup] = useState(false);
        const [selectedDateForNotes, setSelectedDateForNotes] = useState(null);
        const [notesPopupPosition, setNotesPopupPosition] = useState({ x: 0, y: 0 });
        const [dateNotes, setDateNotes] = useState({}); // Store notes by date
        const [noteInput, setNoteInput] = useState('');

        // NEW: Add these
        const calendarRef = useRef(null);
        const [calendarHeight, setCalendarHeight] = useState(0);

        const dates = [];

        // 1. Isi tanggal bulan sebelumnya untuk slot kosong di awal
        if (firstDay > 0) {
            const prevMonthLastDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0).getDate();
            for (let i = firstDay - 1; i >= 0; i--) {
                dates.push(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, prevMonthLastDate - i));
            }
        }

        // 2. Isi tanggal bulan ini
        for (let i = 1; i <= daysInMonth; i++) {
            dates.push(new Date(currentDate.getFullYear(), currentDate.getMonth(), i));
        }

        // 3. Isi tanggal bulan berikutnya untuk melengkapi baris terakhir
        const totalFilledCells = dates.length;
        const remainingCells = 7 - (totalFilledCells % 7);
        if (remainingCells < 7) { // Kalau tidak genap kelipatan 7
            for (let i = 1; i <= remainingCells; i++) {
                dates.push(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, i));
            }
        }

        // NEW: Detect calendar height
        useEffect(() => {
            const updateCalendarHeight = () => {
                if (calendarRef.current) {
                    const height = calendarRef.current.offsetHeight;
                    setCalendarHeight(height);
                }
            };

            updateCalendarHeight();
            
            // Update on window resize
            window.addEventListener('resize', updateCalendarHeight);
            return () => window.removeEventListener('resize', updateCalendarHeight);
        }, [currentDate, dates.length]); // Re-measure when calendar content changes

        useEffect(() => {
            const loadNotes = async () => {
                try {
                    // Get current month range
                    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
                    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
                    
                    const startDate = startOfMonth.toISOString().split('T')[0];
                    const endDate = endOfMonth.toISOString().split('T')[0];
                                        
                    const response = await fetch(`/api/calendar-notes?start_date=${startDate}&end_date=${endDate}`, {
                        headers: {
                            'Accept': 'application/json',
                            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
                        },
                    });

                    if (response.ok) {
                        const notes = await response.json();
                        
                        // Use consistent YYYY-MM-DD format as key
                        const notesMap = {};
                        Object.entries(notes).forEach(([date, noteObj]) => {
                            notesMap[date] = noteObj.note; // Direct use database date format
                        });
                        
                        setDateNotes(notesMap);
                    } else {
                        console.error('❌ Failed to load notes:', response.status, response.statusText);
                    }
                } catch (error) {
                    console.error('❌ Failed to load notes:', error);
                }
            };

            loadNotes();
        }, [currentDate.getMonth(), currentDate.getFullYear()]);

        const getContentForDate = (date) => {
            if (!date) return [];
            
            let tasksForDate = contents.filter((task) => {
                // Check both dueDate and followUpDate for sales tasks
                const taskDate = task.category === 'sales' && task.followUpDate 
                    ? new Date(task.followUpDate)
                    : new Date(task.dueDate);
                return taskDate.toDateString() === date.toDateString();
            });
            
            // Apply category filter
            if (calendarFilter !== 'all') {
                tasksForDate = tasksForDate.filter(task => task.category === calendarFilter);
            }
            
            // Apply content target filter (only for content category)
            if (calendarFilter === 'content' && contentTargetFilter !== 'all') {
                tasksForDate = tasksForDate.filter(task => {
                    if (contentTargetFilter === 'in-house') {
                        return task.contentTarget === 'in-house';
                    } else if (contentTargetFilter === 'client') {
                        return task.contentTarget === 'client';
                    }
                    return true;
                });
            }
            
            return tasksForDate;
        };

        const navigateMonth = (direction) => {
            const newDate = new Date(currentDate);
            newDate.setMonth(newDate.getMonth() + direction);
            setCurrentDate(newDate);
        };

        // NEW: Navigate by day for expanded detail view
        const navigateDay = (direction) => {
            const newDate = new Date(selectedDate);
            newDate.setDate(newDate.getDate() + direction);
            
            // Update both selectedDate and currentDate to follow the day
            setSelectedDate(newDate);
            
            // If navigating to different month, update currentDate too
            if (newDate.getMonth() !== currentDate.getMonth() || 
                newDate.getFullYear() !== currentDate.getFullYear()) {
                setCurrentDate(newDate);
            }
        };

        // Combined navigation function
        const navigate = (direction) => {
            if (isCalendarCollapsed) {
                navigateDay(direction);
            } else {
                navigateMonth(direction);
            }
        };

        const goToToday = () => {
            const today = new Date();
            setCurrentDate(today);
            setSelectedDate(today);
        };

        const handleMouseEnter = (date, event) => {
            if (!date || window.innerWidth < 768) return;
            
            // Cek apakah tanggal ini memiliki konten, holiday, ATAU notes
            const dateContent = getContentForDate(date);
            const hasHoliday = isHoliday(date);
            const hasNotes = dateNotes[getDateKey(date)]; // ✅ TAMBAH CEK NOTES
            
            if (dateContent.length === 0 && !hasHoliday && !hasNotes) return; // ✅ INCLUDE NOTES CHECK
            
            const rect = event.currentTarget.getBoundingClientRect();
            setPopupPosition({
                x: rect.left + rect.width / 2,
                y: rect.top - 10,
            });
            setHoveredDate(date);
        };

        const handleMouseLeave = () => {
            setHoveredDate(null);
        };

        const getDateKey = (date) => {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        };

        return (
            <div className="space-y-4 relative overflow-hidden">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 p-2">
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={() => navigate(-1)}
                            className="p-2 hover:bg-b-semidark rounded-lg transition-colors"
                            title={isCalendarCollapsed ? "Previous Day" : "Previous Month"}
                        >
                            <ChevronLeft className="w-5 h-5 text-t-light" />
                        </button>

                        <div className="text-center">
                            <h2 className="text-xl font-semibold text-t-mut hover:text-t-light">
                                {isCalendarCollapsed ? (
                                    selectedDate.toLocaleDateString("en-US", {
                                        weekday: "long",
                                        day: "numeric",
                                        month: "long",
                                        year: "numeric",
                                    })
                                ) : (
                                    currentDate.toLocaleDateString("en-US", {
                                        month: "long",
                                        year: "numeric",
                                    })
                                )}
                            </h2>
                        </div>

                        <button
                            onClick={() => navigate(1)}
                            className="p-2 hover:bg-b-semidark rounded-lg transition-colors"
                            title={isCalendarCollapsed ? "Next Day" : "Next Month"}
                        >
                            <ChevronRight className="w-5 h-5 text-t-mut hover:text-t-light" />
                        </button>

                        {isCalendarCollapsed && (
                            <div className="flex items-center justify-center space-x-4">
                                {/* Quick Jump Indicators */}
                                <div className="flex items-center space-x-3">
                                    <button
                                        onClick={() => navigate(-7)}
                                        className="px-2 py-1 text-base bg-b-darklight hover:bg-b-darklight rounded-lg transition-colors"
                                        title="Previous Week"
                                    >
                                        -7d
                                    </button>
                                    <button
                                        onClick={() => navigate(7)}
                                        className="px-2 py-1 text-base bg-b-darklight hover:bg-b-darklight rounded-lg transition-colors"
                                        title="Next Week"
                                    >
                                        +7d
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center space-x-2">

                        {/* Content Target Dropdown - Only show when Content is selected */}
                        {calendarFilter === 'content' && (
                            <Dropdown
                                enableHover={false}
                                options={[
                                    { value: 'all', label: 'All Content', icon: Hash },
                                    { value: 'in-house', label: 'In-House', icon: Briefcase },
                                    { value: 'client', label: 'Client', icon: Users }
                                ]}
                                value={contentTargetFilter}
                                onChange={setContentTargetFilter}
                                placeholder="Content type..."
                                customTrigger={(isOpen) => (
                                    <button className={`px-3 py-2 text-sm rounded-xl transition-all duration-200 font-medium flex items-center space-x-2 bg-b-darklight text-t-light hover:bg-b-semidark ${
                                        contentTargetFilter !== 'all' ? 'ring-1 ring-b-grn' : ''
                                    }`}>
                                        <span>{contentTargetFilter === 'all' ? 'All' : 
                                            contentTargetFilter === 'in-house' ? 'In-House' : 'Client'}</span>
                                        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                                    </button>
                                )}
                            />
                        )}

                        {/* Sort Calendar Dropdown */}
                        <Dropdown
                            enableHover={false}
                            options={[
                                { value: 'all', label: 'All', icon: Hash },
                                { value: 'content', label: 'Content', icon: Twitch },
                                { value: 'project', label: 'Project', icon: Briefcase },
                                { value: 'sales', label: 'Sales', icon: Waypoints }
                            ]}
                            value={calendarFilter}
                            onChange={(value) => {
                                console.log('Calendar filter changed to:', value);
                                setCalendarFilter(value);
                                // Reset content target filter when category changes
                                if (value !== 'content') {
                                    setContentTargetFilter('all');
                                }
                            }}
                            placeholder="Filter tasks..."
                            customTrigger={(isOpen) => (
                                <button className={`px-3 py-2 text-sm rounded-xl transition-all duration-200 font-medium flex items-center space-x-2 bg-b-darklight text-t-light hover:bg-b-semidark ${
                                    calendarFilter !== 'all' ? 'ring-1 ring-b-blue' : ''
                                }`}>
                                    <Filter className="w-4 h-4" />
                                    <span>{calendarFilter === 'all' ? 'All' : 
                                        calendarFilter === 'content' ? 'Content' :
                                        calendarFilter === 'project' ? 'Project' : 'Sales'}</span>
                                    <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                                </button>
                            )}
                        />

                        <button
                            onClick={() => setIsNotesMode(!isNotesMode)}
                            className={`px-3 py-2 text-sm rounded-xl transition-all duration-200 font-medium flex items-center space-x-2 ${
                                isNotesMode 
                                    ? 'bg-b-blue text-t-light hover:bg-b-blue-hov' 
                                    : 'bg-b-darklight text-t-light hover:bg-b-semidark'
                            }`}
                            type="button"
                        >
                            {isNotesMode ? (
                                <>
                                    <span>Done</span>
                                </>
                            ) : (
                                <>
                                    <FileText className="w-4 h-4" />
                                    <span>Notes</span>
                                </>
                            )}
                        </button>
                        
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                goToToday();
                            }}
                            className="px-3 py-2 text-sm rounded-xl transition-all duration-200 font-medium flex items-center space-x-2 bg-b-darklight text-t-light hover:bg-b-semidark"
                            type="button"
                        >
                            Today
                        </button>
                        
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setIsCalendarCollapsed(!isCalendarCollapsed);
                            }}
                            className="p-2.5 text-sm rounded-lg transition-all duration-200 font-medium flex items-center space-x-2 bg-b-darklight text-t-light hover:bg-b-semidark"
                            type="button"
                            title={isCalendarCollapsed ? "Show Calendar" : "Hide Calendar"}
                        >
                            {isCalendarCollapsed ? (
                                <Maximize2 className="w-4 h-4" />
                            ) : (
                                <Minimize2 className="w-4 h-4" />
                            )}
                        </button>
                    </div>
                </div>

                {/* Main Content - Side by Side Layout */}
                <div className={`flex flex-col lg:flex-row ${isCalendarCollapsed ? "gap-0" : "gap-6"} relative`}>
                    {/* Calendar Grid - Kiri */}
                    <div 
                        className={`transition-all duration-500 ease-in-out ${
                            isCalendarCollapsed 
                                ? "lg:w-0 lg:opacity-0 lg:-translate-x-full lg:overflow-hidden" 
                                : "lg:w-2/3 lg:opacity-100 lg:translate-x-0"
                        }`}
                    >
                        <div className="overflow-hidden" ref={calendarRef}>
                            {/* Header Hari */}
                            <div className="grid grid-cols-7 gap-2 mb-4">
                                {[
                                    "Sun",
                                    "Mon",
                                    "Tue",
                                    "Wed",
                                    "Thu",
                                    "Fri",
                                    "Sat",
                                ].map((day, index) => {
                                    const today = new Date();
                                    const todayDayIndex = today.getDay(); // 0=Sunday, 1=Monday, etc.
                                    const isToday = index === todayDayIndex;
                                    const isSunday = index === 0;
                                    
                                    return (
                                    <div
                                        key={day}
                                        className={`p-2 text-center text-xl font-bold text-t-light ${isSunday ? "bg-b-red-inb" : isToday ? "bg-b-darklight" : "bg-b-semidark"} rounded-2xl uppercase`}
                                    >
                                        {day}
                                    </div>
                                    );
                                })}
                            </div>



                            {/* Grid Tanggal dengan Gap */}
                            <div className="grid grid-cols-7 gap-1">
                                {dates.map((date, index) => {
                                    const dayContent = date
                                        ? getContentForDate(date)
                                        : [];
                                    const isSelected = date && selectedDate && isSameDate(date, selectedDate);
                                    const isCurrentDay = date && isToday(date);
                                    const isCurrentMonth = date && date.getMonth() === currentDate.getMonth();

                                    return (
                                        <div
                                            key={index}
                                            className={`aspect-square py-2.5 px-3 rounded-3xl transition-all cursor-pointer ${
                                                !date 
                                                    ? "bg-transparent"
                                                    : (() => {
                                                        if (isNotesMode) {
                                                            return "bg-transparent hover:bg-b-semidark border-2 border-dashed border-borlight";
                                                        } else if (isSelected) {
                                                            return "bg-b-acc hover:bg-b-acc-hov border-0 border-dashed border-b-dark";
                                                        } else if (isHoliday(date)) {
                                                            return "bg-b-semidark hover:bg-b-acc";
                                                        } else {
                                                            return "bg-b-semidark hover:bg-b-acc border-0 border-dashed border-b-dark ";
                                                        }
                                                    })()
                                            } ${!isCurrentMonth ? "opacity-40" : ""}`}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                if (date) {
                                                    if (isNotesMode) {
                                                        // Notes mode - show popup
                                                        const rect = e.currentTarget.getBoundingClientRect();
                                                        setNotesPopupPosition({
                                                            x: rect.left + rect.width / 2,
                                                            y: rect.top - 10,
                                                        });
                                                        setSelectedDateForNotes(date);
                                                        setNoteInput(dateNotes[getDateKey(date)] || '');
                                                        setShowNotesPopup(true);
                                                    } else {
                                                        // Normal mode - select date
                                                        setSelectedDate(date);
                                                    }
                                                }
                                            }}
                                                onMouseEnter={(e) => handleMouseEnter(date, e)}
                                                onMouseLeave={handleMouseLeave}
                                        >
                                            {date && (
                                                <>
                                                    <div className="flex items-center justify-between">
                                                        <span
                                                            className={`text-base leading-none ${
                                                                isCurrentDay
                                                                    ? "font-bold text-t-yel flex items-center justify-center"
                                                                    : isSelected
                                                                    ? "font-bold text-t-light"
                                                                    : isHoliday(date)
                                                                    ? "text-t-light font-bold "
                                                                    : "text-t-mut font-medium "
                                                            }`}
                                                        >
                                                            {date.getDate()}
                                                        </span>
                                                        <div className="flex items-center space-x-1">
                                                            {isHoliday(date) && (
                                                                (() => {
                                                                    const holiday = getHolidayForDate(date);
                                                                    const isIslamic = isIslamicHoliday(holiday);
                                                                    return isIslamic ? (
                                                                        <MoonStar strokeWidth={1.5} className="w-5 h-5 text-t-acc" title={holiday?.summary} />
                                                                    ) : (
                                                                        <Sparkles strokeWidth={1.5} className="w-5 h-5 text-t-yel" title={holiday?.summary} />
                                                                    );
                                                                })()
                                                            )}

                                                            {dateNotes[getDateKey(date)] && (
                                                                <FileText strokeWidth={1} className={`w-3.5 h-3.5
                                                                    ${
                                                                    isCurrentDay
                                                                        ? "text-t-acc rounded-full flex items-center justify-center"
                                                                        : isSelected
                                                                        ? "font-bold text-t-acc"
                                                                        : isHoliday(date)
                                                                        ? "text-t-mut font-bold "
                                                                        : "text-t-darkmut font-medium "
                                                                    }
                                                                `}
                                                                
                                                                title="Has notes" />
                                                            )}

                                                            {dayContent.length > 0 && (
                                                                (() => {
                                                                    const today = new Date();
                                                                    today.setHours(0, 0, 0, 0);
                                                                    
                                                                    // Kategorikan tasks berdasarkan status real
                                                                    const overdueTasks = dayContent.filter(task => {
                                                                        const taskDate = new Date(task.dueDate);
                                                                        taskDate.setHours(0, 0, 0, 0);
                                                                        const isOverdue = taskDate < today && !['published', 'done', 'completed'].includes(task.status);
                                                                        return isOverdue;
                                                                    });
                                                                    
                                                                    const dueTodayTasks = dayContent.filter(task => {
                                                                        const taskDate = new Date(task.dueDate);
                                                                        taskDate.setHours(0, 0, 0, 0);
                                                                        const isDueToday = taskDate.getTime() === today.getTime();
                                                                        return isDueToday && !['published', 'done', 'completed'].includes(task.status);
                                                                    });
                                                                    
                                                                    const inProgressTasks = dayContent.filter(task => 
                                                                        ['in-progress', 'ongoing'].includes(task.status)
                                                                    );
                                                                    
                                                                    const completedTasks = dayContent.filter(task => 
                                                                        ['published', 'done', 'completed'].includes(task.status)
                                                                    );
                                                                    
                                                                    // Priority: Overdue > Due Today > In Progress > Completed > Normal
                                                                    let dotColor = "bg-b-blue"; // default
                                                                    let textColor = "text-t-light";
                                                                    let statusText = "";
                                                                    
                                                                    if (overdueTasks.length > 0) {
                                                                        dotColor = "bg-red-500";
                                                                        textColor = "text-t-red";
                                                                        statusText = `${overdueTasks.length} overdue`;
                                                                    } else if (dueTodayTasks.length > 0) {
                                                                        dotColor = "bg-orange-500";
                                                                        textColor = "text-orange-400";
                                                                        statusText = `${dueTodayTasks.length} due today`;
                                                                    } else if (inProgressTasks.length > 0) {
                                                                        dotColor = "bg-yellow-500";
                                                                        textColor = "text-yellow-400";
                                                                        statusText = `${inProgressTasks.length} in progress`;
                                                                    } else if (completedTasks.length > 0) {
                                                                        dotColor = "bg-green-500";
                                                                        textColor = "text-green-400";
                                                                        statusText = `${completedTasks.length} completed`;
                                                                    } else {
                                                                        dotColor = "bg-b-blue";
                                                                        textColor = "text-t-light";
                                                                        statusText = `${dayContent.length} scheduled`;
                                                                    }
                                                                    
                                                                    // return (
                                                                    //     <div className="flex items-center space-x-1" title={statusText}>
                                                                    //         <div className={`w-2 h-2 ${dotColor} rounded-full ${
                                                                    //             overdueTasks.length > 0 ? 'animate-pulse' : ''
                                                                    //         }`}></div>
                                                                    //         <span className={`text-xs ${textColor} font-medium`}>
                                                                    //             {dayContent.length}
                                                                    //         </span>
                                                                    //     </div>
                                                                    // );
                                                                })()
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Task Category Icons - Simple Grid Layout */}
                                                    <div className={`flex items-center justify-center overflow-hidden flex-1
                                                            ${
                                                                isCurrentDay
                                                                    ? "font-bold text-t-mut flex items-center justify-center"
                                                                    : isSelected
                                                                    ? "font-bold text-t-mut"
                                                                    : isHoliday(date)
                                                                    ? "text-t-mut font-bold "
                                                                    : "text-t-darkmut font-medium "
                                                            }`}>
                                                        {(() => {
                                                            if (dayContent.length === 0) return null;
                                                            
                                                            // Get unique categories from tasks
                                                            const categories = [...new Set(dayContent.map(task => task.category))];
                                                            
                                                            if (categories.length === 1) {
                                                                // Single category - center
                                                                const category = categories[0];
                                                                const categoryConfig = TASK_CATEGORIES[category.toUpperCase()];
                                                                const Icon = categoryConfig?.icon || FileText;
                                                                const taskCount = dayContent.length;
                                                                
                                                                return (
                                                                    <div className="relative flex items-center justify-center mt-1">
                                                                        <Icon className="w-2.5 h-2.5 sm:w-3 sm:h-3 lg:w-8 lg:h-8 " />
                                                                        {taskCount > 1 && (
                                                                            <span className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 w-2 h-2 sm:w-2.5 sm:h-2.5 lg:w-3 lg:h-3 bg-t-grn text-white text-[6px] sm:text-[7px] lg:text-[8px] font-bold rounded-full flex items-center justify-center">
                                                                                {taskCount > 9 ? '9' : taskCount}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                );
                                                            } else if (categories.length === 2) {
                                                                // Two categories - left right
                                                                return (
                                                                    <div className="flex items-center space-x-0.5 mt-3">
                                                                        {categories.map((category) => {
                                                                            const categoryConfig = TASK_CATEGORIES[category.toUpperCase()];
                                                                            const Icon = categoryConfig?.icon || FileText;
                                                                            const taskCount = dayContent.filter(task => task.category === category).length;
                                                                            
                                                                            return (
                                                                                <div key={category} className="relative flex items-center justify-center">
                                                                                    <Icon className="w-2.5 h-2.5 sm:w-3 sm:h-3 lg:w-5 lg:h-5 " />
                                                                                    {taskCount > 1 && (
                                                                                        <span className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 w-2 h-2 sm:w-2.5 sm:h-2.5 lg:w-3 lg:h-3 bg-b-grn text-white text-[6px] sm:text-[7px] lg:text-[8px] font-bold rounded-full flex items-center justify-center">
                                                                                            {taskCount > 9 ? '9' : taskCount}
                                                                                        </span>
                                                                                    )}
                                                                                </div>
                                                                            );
                                                                        })}
                                                                    </div>
                                                                );
                                                            } else if (categories.length === 3) {
                                                                // Three categories - 1 top, 2 bottom  
                                                                return (
                                                                    <div className="flex flex-col items-center space-y-0.5">
                                                                        {/* Top single icon */}
                                                                        <div className="relative flex items-center justify-center">
                                                                            {(() => {
                                                                                const categoryConfig = TASK_CATEGORIES[categories[0].toUpperCase()];
                                                                                const Icon = categoryConfig?.icon || FileText;
                                                                                
                                                                                return (
                                                                                    <>
                                                                                        <Icon className="w-2.5 h-2.5 sm:w-3 sm:h-3 lg:w-5 lg:h-5 " />
                                                                                    </>
                                                                                );
                                                                            })()}
                                                                        </div>
                                                                        
                                                                        {/* Bottom two icons */}
                                                                        <div className="flex items-center space-x-1">
                                                                            {categories.slice(1, 3).map((category) => {
                                                                                const categoryConfig = TASK_CATEGORIES[category.toUpperCase()];
                                                                                const Icon = categoryConfig?.icon || FileText;
                                                                                const taskCount = dayContent.filter(task => task.category === category).length;
                                                                                
                                                                                return (
                                                                                    <div key={category} className="relative flex items-center justify-center">
                                                                                        <Icon className="w-2.5 h-2.5 sm:w-3 sm:h-3 lg:w-5 lg:h-5 " />
                                                                                    </div>
                                                                                );
                                                                            })}
                                                                        </div>
                                                                    </div>
                                                                );
                                                            } else {
                                                                // 4+ categories - 2 top, 2 bottom
                                                                return (
                                                                    <div className="flex flex-col items-center space-y-0.5">
                                                                        {/* Top two icons */}
                                                                        <div className="flex items-center space-x-1">
                                                                            {categories.slice(0, 2).map((category) => {
                                                                                const categoryConfig = TASK_CATEGORIES[category.toUpperCase()];
                                                                                const Icon = categoryConfig?.icon || FileText;
                                                                                const taskCount = dayContent.filter(task => task.category === category).length;
                                                                                
                                                                                return (
                                                                                    <div key={category} className="relative flex items-center justify-center">
                                                                                        <Icon className="w-2.5 h-2.5 sm:w-3 sm:h-3 lg:w-5 lg:h-5 " />
                                                                                    </div>
                                                                                );
                                                                            })}
                                                                        </div>
                                                                        
                                                                        {/* Bottom two icons */}
                                                                        <div className="flex items-center space-x-1">
                                                                            {categories.slice(2, 4).map((category) => {
                                                                                const categoryConfig = TASK_CATEGORIES[category.toUpperCase()];
                                                                                const Icon = categoryConfig?.icon || FileText;
                                                                                const taskCount = dayContent.filter(task => task.category === category).length;
                                                                                
                                                                                return (
                                                                                    <div key={category} className="relative flex items-center justify-center">
                                                                                        <Icon className="w-2.5 h-2.5 sm:w-3 sm:h-3 lg:w-5 lg:h-5 " />
                                                                                    </div>
                                                                                );
                                                                            })}
                                                                            
                                                                            {/* +X if more than 4 */}
                                                                            {categories.length > 4 && (
                                                                                <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 lg:w-3 lg:h-3 bg-b-acc rounded-full flex items-center justify-center border border-b-semidark ml-0.5">
                                                                                    <span className="text-[4px] sm:text-[5px] text-t-acc font-bold">
                                                                                        +{categories.length - 4}
                                                                                    </span>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                );
                                                            }
                                                        })()}
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Detail Panel - Kanan dengan Dynamic Width */}
                    <div 
                        className={`w-full transition-all duration-500 ease-in-out ${
                            isCalendarCollapsed ? "lg:w-full" : "lg:w-1/3"
                        }`}
                    >
                        <div className="sticky top-4 rounded-2xl overflow-hidden">
                            {selectedDate && (
                            <div className={`overflow-y-auto hide-scrollbar ${
                                isCalendarCollapsed 
                                    ? "max-h-[600px] space-y-4" 
                                    : "space-y-0"
                            }`} style={isCalendarCollapsed ? {} : {
                                height: calendarHeight > 0 ? `${calendarHeight}px` : 'auto',
                                minHeight: calendarHeight > 0 ? `${calendarHeight}px` : '400px'
                            }}>
                                {/* Holiday Info */}
                                {isHoliday(selectedDate) && (
                                    <div className="p-4 bg-b-red/20 border border-red-500/30 rounded-lg mb-4">
                                        <div className="flex items-center space-x-2 mb-2">
                                            <div className="w-3 h-3 bg-b-red rounded-full"></div>
                                            <h4 className="font-medium text-t-red">🎉 Hari Libur Nasional</h4>
                                        </div>
                                        <p className="text-sm text-t-red font-medium">
                                            {getHolidayForDate(selectedDate)?.summary}
                                        </p>
                                        {getHolidayForDate(selectedDate)?.description && (
                                            <p className="text-xs text-t-red mt-1 opacity-80">
                                                {getHolidayForDate(selectedDate)?.description}
                                            </p>
                                        )}
                                    </div>
                                )}
                                
                                {/* Content Grid - Dynamic Layout */}
                                <div className={
                                    isCalendarCollapsed && getContentForDate(selectedDate).length > 0
                                        ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2"
                                        : "space-y-4"
                                }>
                                    {selectedDate && getContentForDate(selectedDate).map((task) => {
                                        const category = TASK_CATEGORIES[task.category.toUpperCase()];
                                        const Icon = category?.icon || FileText;
                                        
                                        const getStatusLabel = () => {
                                            // Special handling untuk Sales Pipeline
                                            if (task.category === 'sales') {
                                                if (task.dealStage) {
                                                    return String(task.dealStage).replace(/\b\w/g, l => l.toUpperCase());
                                                }
                                                return 'Lead'; // Default sales stage
                                            }
                                            
                                            // Regular status untuk Content & Project
                                            if (category?.statusLabels && category.statusLabels[task.status]) {
                                                return category.statusLabels[task.status];
                                            }
                                            
                                            // ✅ FIX: Handle null/undefined status
                                            if (!task.status || task.status === 'null' || task.status === 'undefined') {
                                                return 'Not Set';
                                            }
                                            
                                            return String(task.status).replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
                                        };

                                        const getDeadlineTime = () => {
                                            const dateField = task.category === 'sales' && task.followUpDate 
                                                ? task.followUpDate 
                                                : task.dueDate;
                                            return new Date(dateField).toLocaleTimeString("id-ID", {
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            });
                                        };

                                        return (
                                                <div
                                                    key={task.id}
                                                    className={`relative p-6 bg-b-semidark rounded-3xl transition-all duration-300 hover:shadow-lg cursor-pointer group ${
                                                        isCalendarCollapsed ? "hover:scale-100" : ""
                                                    }`}
                                                    onClick={(e) => {
                                                        if (e.target.closest('.three-dots-menu')) return;
                                                        onTaskClick(task);
                                                    }}
                                                >

                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center space-x-2 text-t-mut">
                                                        <Icon className="w-4 h-4" />
                                                        <span className="text-sm">
                                                            {category?.name?.split(' ')[0] || 'Task'}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5">
                                                        <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                                                            task.category === 'sales' 
                                                                ? (() => {
                                                                    const stageColors = {
                                                                        'lead': 'bg-gray-500/20 text-gray-400',
                                                                        'qualified': 'bg-blue-500/20 text-blue-400', 
                                                                        'proposal': 'bg-yellow-500/20 text-yellow-400',
                                                                        'negotiation': 'bg-orange-500/20 text-orange-400',
                                                                        'closed': 'bg-green-500/20 text-green-400'
                                                                    };
                                                                    return stageColors[task.dealStage] || 'bg-gray-500/20 text-gray-400';
                                                                })()
                                                                : 'bg-b-darklight text-t-light'
                                                        }`}>
                                                            {getStatusLabel()}
                                                        </span>

                                                        {/* Three Dots Menu - Top Right */}
                                                        <div className="three-dots-menu">
                                                            <ThreeDotsMenu
                                                                options={[
                                                                    {
                                                                        label: "Edit",
                                                                        icon: Edit3,
                                                                        onClick: () => {
                                                                            setEditingTask(task);
                                                                            setIsEditMode(true);
                                                                            setIsViewMode(false);
                                                                            setViewingTask(null);
                                                                            setIsCreatePanelOpen(true);
                                                                            setPanelContent('edit');
                                                                        }
                                                                    },
                                                                    {
                                                                        label: "Delete",
                                                                        icon: Trash2,
                                                                        danger: true,
                                                                        onClick: () => {
                                                                            setIsDeleteModalOpen(true);
                                                                            setTaskToDelete(task);
                                                                        }
                                                                    }
                                                                ]}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                <h4 className={`font-medium text-t-light line-clamp-1 my-2 ${
                                                    isCalendarCollapsed ? "text-lg" : "text-base"
                                                }`}>
                                                    {task.title}
                                                </h4>
                                                {/* <p className={`text-t-light line-clamp-2 mb-2 ${
                                                    isCalendarCollapsed ? "text-sm" : "text-sm"
                                                }`}>
                                                    {task.notes || task.description}
                                                </p> */}

                                                {task.category === 'sales' && task.dealValue && (
                                                    <div className="flex items-center space-x-1 mb-2">
                                                        <Star className="w-3 h-3 text-t-yel" />
                                                        <span className="text-xs font-medium text-t-yel">
                                                            {(() => {
                                                                // Smart formatting - detect currency dari content
                                                                const isUSD = task.dealValue.includes('$') || task.dealCurrency === 'USD';
                                                                const isIDR = task.dealValue.includes('Rp') || task.dealCurrency === 'IDR';
                                                                
                                                                if (isUSD || isIDR) {
                                                                    // Already formatted
                                                                    return task.dealValue;
                                                                } else {
                                                                    // Format with default IDR
                                                                    return formatCurrency(task.dealValue, task.dealCurrency || 'IDR');
                                                                }
                                                            })()}
                                                        </span>
                                                    </div>
                                                )}
                                                
                                                <div className="flex flex-col text-t-light gap-2">
                                                    <div className="flex items-center flex-row gap-3 justify-between">
                                                        <div className="flex items-center gap-2">
                                                            {task.priority && (() => {
                                                                const priorityDisplay = getPriorityDisplay(task.priority);
                                                                return (
                                                                    <span className={`px-2 py-1 rounded-md text-xs ${priorityDisplay.bgClass}`}>
                                                                        {priorityDisplay.label}
                                                                    </span>
                                                                );
                                                            })()}
                                                        </div>
                                                        <div className="flex items-center gap-2 text-t-mut/75">
                                                            <span className="flex items-center gap-0.5">
                                                                <Clock className="w-3 h-3" /> 
                                                                {getDeadlineTime()}
                                                            </span>
                                                            <span className="flex items-center gap-0.5">
                                                                <User className="w-3 h-3" /> 
                                                                {task.assignee.name.split(' ')[0]}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {selectedDate && getContentForDate(selectedDate).length === 0 && !isHoliday(selectedDate) && (
                                    <div className={`text-center text-t-light bg-b-semidark rounded-3xl transition-all duration-300 hover:shadow-lg  ${
                                        isCalendarCollapsed ? "py-16" : "py-8"
                                    }`}>
                                        <CalendarIcon className={`mx-auto mb-2 text-t-mut ${
                                            isCalendarCollapsed ? "w-16 h-16" : "w-8 h-8"
                                        }`} />
                                        <p className={isCalendarCollapsed ? "text-lg mb-4" : "mb-2"}>
                                            No content scheduled for this date
                                        </p>
                                        {isCalendarCollapsed && (
                                            <p className="text-sm text-t-light mb-6">
                                                {selectedDate.toLocaleDateString("id-ID", {
                                                    weekday: "long",
                                                    day: "numeric",
                                                    month: "long",
                                                    year: "numeric",
                                                })}
                                            </p>
                                        )}
                                        <button
                                            className="px-4 py-2 text-sm bg-b-grn hover:bg-b-grn text-t-light rounded-lg transition-colors font-medium flex items-center mx-auto"
                                            onClick={() => setIsCreatePanelOpen(true)}
                                        >
                                            <Plus className="w-4 h-4 mr-2" />
                                            Schedule Content
                                        </button>
                                    </div>
                                )}

                                {selectedDate && getContentForDate(selectedDate).length === 0 && isHoliday(selectedDate) && (
                                    <div className="text-center py-8 text-t-light">
                                        <CalendarIcon className="w-8 h-8 mx-auto mb-2 text-t-light" />
                                        <p>No content scheduled for this holiday</p>
                                        <p className="text-sm mt-2">Enjoy your holiday! 🎉</p>
                                        <button
                                            size="sm"
                                            className="mt-3"
                                            onClick={() => setIsCreatePanelOpen(true)}
                                        >
                                            Schedule Holiday Content
                                        </button>
                                    </div>
                                )}

                                {/* {!selectedDate && (
                                    <div className="text-center py-8 text-t-light">
                                        <CalendarIcon className="w-8 h-8 mx-auto mb-2 text-t-light" />
                                        <p>Click on a date to view details</p>
                                        <p className="text-sm mt-2">Select any date from the calendar to see scheduled content</p>
                                    </div>
                                )} */}
                            </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Hover Popup for Desktop - Clean & Simple */}
                {hoveredDate && (
                    <div
                        className="fixed z-50 bg-b-semidark/95 backdrop-blur-xl border border-bor rounded-2xl shadow-xl p-3 max-w-xs transform -translate-x-1/2 -translate-y-full pointer-events-none"
                        style={{
                            left: `${popupPosition.x}px`,
                            top: `${popupPosition.y}px`,
                        }}
                    >
                        {/* Holiday (if exists) */}
                        {isHoliday(hoveredDate) && (
                            <div className="text-sm text-t-yel mb-2 flex items-center">
                                🎉 {getHolidayForDate(hoveredDate)?.summary}
                            </div>
                        )}

                        {/* Task Titles with Category Icons */}
                        <div className="space-y-1">
                            {getContentForDate(hoveredDate).length > 0 ? (
                                getContentForDate(hoveredDate).map((task, index) => {
                                    const category = TASK_CATEGORIES[task.category.toUpperCase()];
                                    const Icon = category?.icon || FileText;
                                    
                                    return (
                                        <div key={task.id} className="text-sm text-t-light truncate flex items-center space-x-2">
                                            <Icon className="w-3.5 h-3.5 text-t-mut flex-shrink-0" />
                                            <span className="truncate line-clamp-1">{task.title}</span>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="text-xs text-t-mut italic">
                                    No tasks scheduled
                                </div>
                            )}
                        </div>

                        {/* Notes Section */}
                        {dateNotes[getDateKey(hoveredDate)] && (
                            <div className="mt-3 pt-2 border-t border-bor">
                                <div className="flex items-center space-x-1 mb-1">
                                    <FileText className="w-3 h-3 text-t-blue" />
                                    <span className="text-xs font-medium text-t-blue">Note</span>
                                </div>
                                <div className="text-xs text-t-light bg-b-darklight/50 rounded">
                                    {dateNotes[getDateKey(hoveredDate)]}
                                </div>
                            </div>
                        )}

                    </div>
                )}

                {/* Notes Input Popup */}
                {showNotesPopup && selectedDateForNotes && (
                    <div
                        className="fixed z-50 bg-b-dark/95 backdrop-blur-2xl border border-bor rounded-2xl shadow-xl p-4 w-80 transform -translate-x-1/2 -translate-y-full pointer-events-auto"
                        style={{
                            left: `${notesPopupPosition.x}px`,
                            top: `${notesPopupPosition.y}px`,
                        }}
                    >
                        {/* Input */}
                        <textarea
                            value={noteInput}
                            onChange={(e) => setNoteInput(e.target.value)}
                            placeholder="Add your note for this date..."
                            className="w-full px-3 py-2 bg-b-darklight text-t-light rounded-2xl resize-none focus:ring-0 focus:ring-bor-grn focus:outline-none"
                            rows={3}
                            autoFocus
                        />

                        {/* Buttons */}
                        <div className="flex space-x-2 mt-3">
                            <button
                                onClick={() => setShowNotesPopup(false)}
                                className="px-3 py-2 text-sm bg-b-darklight hover:bg-b-semidark text-t-light rounded-xl transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={async () => {
                                try {
                                    const dateString = getDateKey(selectedDateForNotes);
                                    
                                    if (noteInput.trim()) {
                                        // Save note to database
                                        const response = await fetch('/api/calendar-notes', {
                                            method: 'POST',
                                            headers: {
                                                'Content-Type': 'application/json',
                                                'Accept': 'application/json',
                                                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
                                            },
                                            body: JSON.stringify({
                                                date: dateString,
                                                note: noteInput.trim()
                                            }),
                                        });

                                        if (response.ok) {
                                            // Update local state with same key format
                                            setDateNotes(prev => ({
                                                ...prev,
                                                [dateString]: noteInput.trim()
                                            }));
                                            console.log('✅ Note saved successfully for:', dateString);
                                            
                                            // ✅ REFRESH BOARD ACTIVITY
                                            if (recentActivityRef.current) {
                                                setTimeout(() => {
                                                    recentActivityRef.current.refresh();
                                                }, 500);
                                            }
                                        }
                                    } else {
                                        // Delete note if empty
                                        const response = await fetch('/api/calendar-notes', {
                                            method: 'DELETE',
                                            headers: {
                                                'Content-Type': 'application/json',
                                                'Accept': 'application/json',
                                                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
                                            },
                                            body: JSON.stringify({
                                                date: dateString
                                            }),
                                        });

                                        if (response.ok) {
                                            // Update local state
                                            setDateNotes(prev => {
                                                const newNotes = { ...prev };
                                                delete newNotes[dateString];
                                                return newNotes;
                                            });
                                            console.log('✅ Note deleted successfully for:', dateString);
                                            
                                            // ✅ REFRESH BOARD ACTIVITY  
                                            if (recentActivityRef.current) {
                                                setTimeout(() => {
                                                    recentActivityRef.current.refresh();
                                                }, 500);
                                            }
                                        }
                                    }
                                } catch (error) {
                                }
                                
                                setShowNotesPopup(false);
                                setNoteInput('');
                            }}
                                className="flex-1 px-3 py-2 text-sm bg-b-red-inb hover:bg-b-red-inb-hov text-t-light rounded-xl transition-colors"
                            >
                                Save Note
                            </button>
                        </div>
                    </div>
                )}

            </div>
        );
    }, (prevProps, nextProps) => {
        // Only re-render if selectedDate actually changes
        return prevProps.selectedDate?.getTime() === nextProps.selectedDate?.getTime();
    });

    // Comments Component
    const TaskComments = ({ task, onCommentAdded, onNotificationUpdate }) => {
        const [comments, setComments] = useState([]);
        const [newComment, setNewComment] = useState('');
        const [loading, setLoading] = useState(false);
        const [editingComment, setEditingComment] = useState(null);
        const [editText, setEditText] = useState('');

        // Load comments on mount and set up polling
        useEffect(() => {
            if (task?.id) {
                loadComments();
                
                // Set up polling every 3 seconds
                const interval = setInterval(() => {
                    loadComments();
                }, 3000);

                return () => clearInterval(interval);
            }
        }, [task?.id]);

        const loadComments = async () => {
            try {
                const commentsData = await api.fetchComments(task.id);
                setComments(commentsData);
            } catch (error) {
                console.error('Failed to load comments:', error);
            }
        };

        const handleSubmitComment = async (e) => {
            e.preventDefault();
            if (!newComment.trim()) return;

            setLoading(true);
            try {
                const comment = await api.createComment(task.id, {
                    comment: newComment.trim()
                });
                
                setComments(prev => [...prev, comment]);
                setNewComment('');
                onCommentAdded && onCommentAdded();
                onNotificationUpdate && onNotificationUpdate();
            } catch (error) {
                console.error('Failed to add comment:', error);
            } finally {
                setLoading(false);
            }
        };

        const handleEditComment = async (commentId) => {
            if (!editText.trim()) return;

            try {
                const updatedComment = await api.updateComment(commentId, {
                    comment: editText.trim()
                });
                
                setComments(prev => prev.map(c => 
                    c.id === commentId ? updatedComment : c
                ));
                setEditingComment(null);
                setEditText('');
            } catch (error) {
                console.error('Failed to update comment:', error);
            }
        };

        const handleDeleteComment = async (commentId) => {
            if (!confirm('Delete this comment?')) return;

            try {
                await api.deleteComment(commentId);
                setComments(prev => prev.filter(c => c.id !== commentId));
            } catch (error) {
                console.error('Failed to delete comment:', error);
            }
        };

        const startEdit = (comment) => {
            setEditingComment(comment.id);
            setEditText(comment.comment);
        };

        const formatTime = (dateString) => {
            const date = new Date(dateString);
            const now = new Date();
            const diffInMinutes = Math.floor((now - date) / (1000 * 60));
            
            if (diffInMinutes < 1) return 'Just now';
            if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
            if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
            return date.toLocaleDateString();
        };

        return (
            <div className="mt-6 pt-6 border-t border-bor">
                <h3 className="text-lg font-semibold text-t-light mb-4 flex items-center">
                    <MessageSquare className="w-5 h-5 mr-2" />
                    Discussion ({comments.length})
                </h3>

                {/* Comments List */}
                <div className="space-y-4 mb-6 max-h-80 overflow-y-auto">
                    {comments.map((comment) => (
                        <div key={comment.id} className="flex space-x-3">
                            <Avatar name={comment.user_name} size="sm" src={comment.user_avatar} />
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center space-x-2 mb-1">
                                    <span className="font-medium text-t-light text-sm">{comment.user_name}</span>
                                    <span className="text-xs text-t-mut">{formatTime(comment.created_at)}</span>
                                    {comment.user_id === window.Laravel?.user?.id && (
                                        <div className="flex space-x-1">
                                            <button
                                                onClick={() => startEdit(comment)}
                                                className="text-xs text-t-mut hover:text-t-light"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDeleteComment(comment.id)}
                                                className="text-xs text-t-red hover:text-t-red"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    )}
                                </div>
                                
                                {editingComment === comment.id ? (
                                    <div className="space-y-2">
                                        <textarea
                                            value={editText}
                                            onChange={(e) => setEditText(e.target.value)}
                                            className="w-full px-3 py-2 text-sm bg-b-darklight text-t-light rounded-lg resize-none"
                                            rows={2}
                                        />
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => handleEditComment(comment.id)}
                                                className="px-3 py-1 text-xs bg-b-blue text-t-light rounded-lg"
                                            >
                                                Save
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setEditingComment(null);
                                                    setEditText('');
                                                }}
                                                className="px-3 py-1 text-xs bg-b-darklight text-t-light rounded-lg"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-sm text-t-light bg-b-darklight rounded-lg px-3 py-2">
                                        {comment.comment}
                                    </p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Add Comment Form */}
                <form onSubmit={handleSubmitComment} className="space-y-3">
                    <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Write a comment..."
                        className="w-full px-4 py-3 bg-b-darklight text-t-light rounded-lg resize-none focus:ring-2 focus:ring-bor-grn"
                        rows={3}
                        disabled={loading}
                    />
                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={loading || !newComment.trim()}
                            className="px-4 py-2 bg-b-grn hover:bg-green-600 text-t-light rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                        >
                            {loading ? (
                                <LoadingSpinner size="sm" />
                            ) : (
                                <Send className="w-4 h-4" />
                            )}
                            <span>{loading ? 'Posting...' : 'Post Comment'}</span>
                        </button>
                    </div>
                </form>
            </div>
        );
    };

    // Detail Task View Component - REDESIGNED untuk Panel Sempit
    const DetailTaskView = ({ task, onEdit, onClose, onDelete, onNotificationUpdate }) => {
        const category = TASK_CATEGORIES[task.category.toUpperCase()];
        const Icon = category?.icon || FileText;
        
        const getStatusLabel = () => {
            // Special handling untuk Sales Pipeline - prioritize Deal Stage
            if (task.category === 'sales') {
                if (task.dealStage) {
                    // Capitalize deal stage
                    return String(task.dealStage).replace(/\b\w/g, l => l.toUpperCase());
                }
                return 'Lead'; // Default sales stage
            }
            
            // Regular status handling untuk Content & Project
            if (!task.status || task.status === 'not set') {
                return 'Not Set';
            }
            if (category?.statusLabels && category.statusLabels[task.status]) {
                return category.statusLabels[task.status];
            }
            return String(task.status).replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
        };

        const getDeadlineDate = () => {
            if (task.category === 'sales' && task.followUpDate) {
                return task.followUpDate;
            }
            return task.dueDate;
        };

        const getPriorityDisplay = () => {
            return PRIORITY_CONFIG[task.priority] || { 
                label: 'Normal', 
                bgClass: 'bg-gray-500/20 text-gray-400' 
            };
        };

        const renderCategorySpecificInfo = () => {
            switch (task.category) {
                case 'content':
                    return (
                        <div className="space-y-3">
                            {task.contentType && (
                                <div className="bg-b-darklight rounded-lg p-3">
                                    <div className="flex items-center space-x-2 mb-1">
                                        <Video className="w-4 h-4 text-t-blue" />
                                        <span className="text-sm font-medium text-t-mut">Content Type</span>
                                    </div>
                                    <span className="text-t-light">{task.contentType}</span>
                                </div>
                            )}
                            {task.platforms?.length > 0 && (
                                <div className="bg-b-darklight rounded-lg p-3">
                                    <div className="flex items-center space-x-2 mb-2">
                                        <Share2 className="w-4 h-4 text-t-purp" />
                                        <span className="text-sm font-medium text-t-mut">Platforms</span>
                                    </div>
                                    <div className="flex flex-wrap gap-1">
                                        {task.platforms.map(platform => (
                                            <span key={platform} className="px-2 py-1 bg-b-acc text-t-acc rounded-md text-xs">
                                                {platform}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                    
                case 'project':
                    return (
                        <div className="space-y-3">
                            {task.parentProject && (
                                <div className="bg-b-darklight rounded-lg p-3">
                                    <div className="flex items-center space-x-2 mb-1">
                                        <Folder className="w-4 h-4 text-t-yel" />
                                        <span className="text-sm font-medium text-t-mut">Project</span>
                                    </div>
                                    <span className="text-t-light">{task.parentProject}</span>
                                </div>
                            )}
                            {task.projectCategory && (
                                <div className="bg-b-darklight rounded-lg p-3">
                                    <div className="flex items-center space-x-2 mb-1">
                                        <Package className="w-4 h-4 text-t-grn" />
                                        <span className="text-sm font-medium text-t-mut">Category</span>
                                    </div>
                                    <span className="text-t-light">{task.projectCategory}</span>
                                </div>
                            )}
                        </div>
                    );
                    
                case 'sales':
                    return (
                        <div className="space-y-3">
                            {task.salesActivity && (
                                <div className="bg-b-darklight rounded-lg p-3">
                                    <div className="flex items-center space-x-2 mb-1">
                                        <Phone className="w-4 h-4 text-t-blue" />
                                        <span className="text-sm font-medium text-t-mut">Activity</span>
                                    </div>
                                    <span className="text-t-light">{task.salesActivity}</span>
                                </div>
                            )}
                            {task.dealStage && (
                                <div className="bg-b-darklight rounded-lg p-3">
                                    <div className="flex items-center space-x-2 mb-1">
                                        <TrendingUp className="w-4 h-4 text-t-grn" />
                                        <span className="text-sm font-medium text-t-mut">Deal Stage</span>
                                    </div>
                                    <span className={`px-2 py-1 rounded-md text-sm font-medium ${
                                        // Use same color logic as badge
                                        (() => {
                                            const stageColors = {
                                                'lead': 'bg-gray-500/20 text-gray-400',
                                                'qualified': 'bg-blue-500/20 text-blue-400', 
                                                'proposal': 'bg-yellow-500/20 text-yellow-400',
                                                'negotiation': 'bg-orange-500/20 text-orange-400',
                                                'closed': 'bg-green-500/20 text-green-400'
                                            };
                                            return stageColors[task.dealStage] || 'bg-gray-500/20 text-gray-400';
                                        })()
                                    }`}>
                                        {String(task.dealStage).replace(/\b\w/g, l => l.toUpperCase())}
                                    </span>
                                </div>
                            )}
                            {task.dealValue && (
                                <div className="bg-b-darklight rounded-lg p-3 border border-t-yel/20">
                                    <div className="flex items-center space-x-2 mb-1">
                                        <Star className="w-4 h-4 text-t-yel" />
                                        <span className="text-sm font-medium text-t-yel">Deal Value</span>
                                        {/* Currency indicator */}
                                        <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${
                                            (task.dealValue.includes('$') || task.dealCurrency === 'USD')
                                                ? 'bg-green-500/20 text-green-400'
                                                : 'bg-red-500/20 text-red-400'
                                        }`}>
                                            {(task.dealValue.includes('$') || task.dealCurrency === 'USD') ? 'USD' : 'IDR'}
                                        </span>
                                    </div>
                                    <span className="text-lg font-bold text-t-yel">
                                        {(() => {
                                            // Smart formatting
                                            const isUSD = task.dealValue.includes('$') || task.dealCurrency === 'USD';
                                            const isIDR = task.dealValue.includes('Rp') || task.dealCurrency === 'IDR';
                                            
                                            if (isUSD || isIDR) {
                                                return task.dealValue;
                                            } else {
                                                return formatCurrency(task.dealValue, task.dealCurrency || 'IDR');
                                            }
                                        })()}
                                    </span>
                                </div>
                            )}
                        </div>
                    );
                    
                default:
                    return null;
            }
        };

        return (
            <div className="space-y-4">
                {/* Compact Header */}
                <div className="bg-b-darklight rounded-xl p-4">
                    <div className="flex items-start space-x-3">
                        <div className="w-12 h-12 bg-b-acc rounded-xl flex items-center justify-center flex-shrink-0">
                            <Icon className="w-6 h-6 text-t-acc" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-1">
                                <span className="text-xs font-medium text-t-mut uppercase tracking-wide">
                                    {category?.name?.split(' ')[0] || 'Task'}
                                </span>
                                <span className={`px-2 py-1 rounded-md text-xs font-medium ${
                                    task.category === 'sales' 
                                        ? (() => {
                                            // Sales Deal Stage colors
                                            const stageColors = {
                                                'lead': 'bg-gray-500/20 text-gray-400',
                                                'qualified': 'bg-blue-500/20 text-blue-400', 
                                                'proposal': 'bg-yellow-500/20 text-yellow-400',
                                                'negotiation': 'bg-orange-500/20 text-orange-400',
                                                'closed': 'bg-green-500/20 text-green-400'
                                            };
                                            return stageColors[task.dealStage] || 'bg-gray-500/20 text-gray-400';
                                        })()
                                        : task.status ? 'bg-b-semidark text-t-light' : 'bg-gray-500/20 text-gray-400'
                                }`}>
                                    {getStatusLabel()}
                                </span>
                            </div>
                            <h1 className="text-lg font-bold text-t-light leading-tight mb-2">
                                {task.title}
                            </h1>
                            <div className="text-xs text-t-mut">
                                Updated {formatRelativeTime(task.updatedAt)}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Compact Key Information */}
                <div className="space-y-3">
                    {/* Assignee */}
                    <div className="bg-b-darklight rounded-lg p-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <Users className="w-4 h-4 text-t-blue" />
                                <span className="text-sm font-medium text-t-mut">Assignee</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Avatar 
                                    name={task.assignee.name} 
                                    size="sm" 
                                    src={(() => {
                                        const member = workspaceMembers.find(m => m.id === task.assignee_id);
                                        return member?.avatar || null;
                                    })()} 
                                />
                                <span className="text-sm font-medium text-t-light">{task.assignee.name}</span>
                            </div>
                        </div>
                    </div>

                    {/* Due Date & Priority in one row */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-b-darklight rounded-lg p-3">
                            <div className="flex items-center space-x-2 mb-1">
                                <CalendarIcon className="w-4 h-4 text-t-grn" />
                                <span className="text-xs font-medium text-t-mut">
                                    {task.category === 'sales' ? 'Follow-up Date' : 'Due Date'}
                                </span>
                            </div>
                            <div className="text-sm font-medium text-t-light">
                                {formatDate(getDeadlineDate())}
                            </div>
                            <div className="text-xs text-t-mut">
                                {formatTime(getDeadlineDate())}
                            </div>
                        </div>

                        <div className="bg-b-darklight rounded-lg p-3">
                            <div className="flex items-center space-x-2 mb-1">
                                <AlertTriangle className="w-4 h-4 text-t-red" />
                                <span className="text-xs font-medium text-t-mut">Priority</span>
                            </div>
                            {task.priority ? (
                                <span className={`inline-flex px-2 py-1 rounded-md text-xs font-medium ${getPriorityDisplay().bgClass}`}>
                                    {getPriorityDisplay().label}
                                </span>
                            ) : (
                                <span className="text-xs text-t-mut">Not set</span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Client Information - Only for content with client */}
                {task.category === 'content' && task.contentTarget === 'client' && task.client_id && (
                    <div className="bg-b-darklight rounded-lg p-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <Briefcase className="w-4 h-4 text-t-blue" />
                                <span className="text-sm font-medium text-t-mut">Client</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <div className="w-6 h-6 bg-b-blue/20 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <User className="w-3.5 h-3.5 text-t-blue" />
                                </div>
                                <div className="text-right">
                                    <div className="text-sm font-medium text-t-light">
                                        {(() => {
                                            // Find client name from clients array using client_id
                                            const client = (window.ContentPlannerClients || []).find(c => c.id === task.client_id);
                                            return client ? client.name : 'Unknown Client';
                                        })()}
                                    </div>
                                    <div className="text-xs text-t-mut">
                                        {(() => {
                                            const client = (window.ContentPlannerClients || []).find(c => c.id === task.selectedClient);
                                            return client ? (client.customerType === 'business' ? 'Business Client' : 'Personal Client') : 'Client';
                                        })()}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Description/Notes - Compact */}
                <div className="bg-b-darklight rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-3">
                        <FileText className="w-4 h-4 text-t-purp" />
                        <h3 className="text-sm font-semibold text-t-light">
                            {(() => {
                                if (task.category === 'sales') {
                                    // Use dynamic notes config
                                    const notesConfig = getSalesNotesConfig(task.salesActivity);
                                    return notesConfig.label;
                                }
                                return 'Description';
                            })()}
                        </h3>
                    </div>
                    <div className="text-sm text-t-light leading-relaxed whitespace-pre-wrap">
                        {task.notes || task.description || (
                            <span className="text-t-mut italic">
                                {task.category === 'sales' 
                                    ? 'No activity notes provided.' 
                                    : 'No description provided.'
                                }
                            </span>
                        )}
                    </div>
                </div>

                {/* Category Specific Information - Compact */}
                {renderCategorySpecificInfo() && (
                    <div>
                        <h3 className="text-sm font-semibold text-t-light mb-3 flex items-center space-x-2">
                            <Settings className="w-4 h-4 text-t-yel" />
                            <span>Details</span>
                        </h3>
                        {renderCategorySpecificInfo()}
                    </div>
                )}

                {/* Tags - Compact */}
                {task.tags && task.tags.length > 0 && (
                    <div>
                        <div className="flex items-center space-x-2 mb-3">
                            <Tag className="w-4 h-4 text-t-yel" />
                            <h3 className="text-sm font-semibold text-t-light">Tags</h3>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {task.tags.map((tag) => (
                                <span
                                    key={tag}
                                    className="px-2 py-1 bg-b-acc text-t-acc rounded-md text-xs font-medium"
                                >
                                    #{tag}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Comments Section */}
                <TaskComments task={task} onNotificationUpdate={onNotificationUpdate} />

                {/* Compact Action Buttons */}
                <div className="grid grid-cols-2 gap-3 pt-4 border-t border-bor">
                    <button
                        onClick={onEdit}
                        className="flex items-center justify-center space-x-2 px-4 py-3 bg-b-blue hover:bg-blue-600 text-t-light rounded-xl transition-colors font-medium"
                    >
                        <Edit3 className="w-4 h-4" />
                        <span>Edit</span>
                    </button>
                    <button
                        onClick={() => {
                            if (confirm(`Delete "${task.title}"?`)) {
                                onDelete(task.id);
                            }
                        }}
                        className="flex items-center justify-center space-x-2 px-4 py-3 bg-b-red hover:bg-red-600 text-t-light rounded-xl transition-colors font-medium"
                    >
                        <Trash2 className="w-4 h-4" />
                        <span>Delete</span>
                    </button>
                </div>
            </div>
        );
    };

    // Fixed CreateContentForm dengan state management yang benar
    const CreateContentForm = ({ onSubmit, onCancel, editingTask, isEditMode, workspaceMembers = [], currentWorkspace, clients = [], onNavigateToClient }) => {
        const [taskCategory, setTaskCategory] = useState(editingTask?.category || 'content');
        
        // Helper functions
        const getRequiredBlocks = (category) => {
            switch (category) {
                case 'content':
                    return ['title', 'assignee', 'deadline', 'status'];
                case 'project':
                    return ['title', 'assignee', 'deadline', 'status'];
                case 'sales':
                    return ['contact', 'assignee', 'followup_date', 'deal_stage'];
                default:
                    return ['title', 'assignee', 'deadline', 'status'];
            }
        };

        const getExtraOptions = (category) => {
            switch (category) {
                case 'content':
                    return [
                        { id: 'description', name: "Deskripsi", icon: Edit3 },
                        { id: 'content_type', name: "Jenis Konten", icon: Video },
                        { id: 'platform', name: "Platform", icon: Share2 },
                        { id: 'priority', name: "Prioritas", icon: AlertTriangle },
                        { id: 'tags', name: "Tag", icon: Tag }
                    ];
                case 'project':
                    return [
                        { id: 'project', name: "Proyek", icon: Folder },
                        { id: 'description', name: "Deskripsi", icon: Edit3 },
                        { id: 'priority', name: "Prioritas", icon: AlertTriangle },
                        { id: 'category', name: "Kategori", icon: Package },
                        { id: 'tags', name: "Tag", icon: Tag }
                    ];
                case 'sales':
                    return [
                        { id: 'activity_type', name: "Jenis Aktivitas", icon: Phone },
                        { id: 'notes', name: "Catatan", icon: Edit3 },
                        { id: 'deal_value', name: "Nilai Deal", icon: Star },
                        { id: 'priority', name: "Prioritas", icon: AlertTriangle },
                        { id: 'tags', name: "Tag", icon: Tag }
                    ];
                default:
                    return [];
            }
        };

        // SIMPLE STATE - tidak pakai formDataByCategory yang kompleks
        const [formData, setFormData] = useState(() => {
            if (isEditMode && editingTask) {
                return {
                    ...editingTask,
                    // ✅ FIX: Ensure all fields are strings, not null
                    title: editingTask.title || "",
                    description: editingTask.description || "",
                    notes: editingTask.notes || "",
                    dealValue: editingTask.dealValue || "",
                    dealCurrency: editingTask.dealCurrency || "IDR",
                    contact: editingTask.contact || "",
                    salesActivity: editingTask.salesActivity || "",
                    dealStage: editingTask.dealStage || "",
                    contentType: editingTask.contentType || "",
                    parentProject: editingTask.parentProject || "",
                    projectCategory: editingTask.projectCategory || "",
                    dueDate: editingTask.dueDate || "",
                    followUpDate: editingTask.followUpDate || "",
                    assignee: editingTask.assignee || { id: "prawd_task", name: "Prawd Task" },
                    platforms: editingTask.platforms || [],
                    tags: editingTask.tags || [],
                    contentTarget: editingTask.contentTarget || 'in-house',
                    selectedClient: editingTask.client_id || null,
                };
            }
            
            // Default data berdasarkan kategori - FIX semua
            const baseData = {
                title: "",
                description: "",
                notes: "",
                dueDate: "",
                followUpDate: "",
                assignee: { id: "prawd_task", name: "Prawd Task" },
                tags: []
            };

            if (taskCategory === 'content') {
                return {
                    ...baseData,
                    category: 'content',
                    status: 'draft',
                    contentType: "",
                    platforms: [],
                    contentTarget: 'in-house'
                };
            } else if (taskCategory === 'project') {
                return {
                    ...baseData,
                    category: 'project',
                    status: 'todo',
                    parentProject: "",
                    projectCategory: ""
                };
            } else if (taskCategory === 'sales') {
                return {
                    ...baseData,
                    category: 'sales',
                    contact: "",
                    salesActivity: "",
                    dealStage: "lead",
                    dealValue: "",
                    dealCurrency: "IDR",
                    notes: ""
                };
            }
            
            return baseData;
        });

        const [currency, setCurrency] = useState(() => {
            // Ambil currency dari editingTask jika edit mode
            if (isEditMode && editingTask?.dealCurrency) {
                return editingTask.dealCurrency;
            }
            return 'IDR';
        });

        // Update currency saat editingTask berubah
        useEffect(() => {
            if (isEditMode && editingTask?.dealCurrency) {
                setCurrency(editingTask.dealCurrency);
            }
        }, [isEditMode, editingTask?.dealCurrency]);

        const [activeBlocks, setActiveBlocks] = useState(() => {
            if (isEditMode && editingTask) {
                const required = getRequiredBlocks(editingTask.category);
                const extra = [];
                
                if (editingTask.description) extra.push('description');
                if (editingTask.contentType) extra.push('content_type');
                if (editingTask.platforms?.length) extra.push('platform');
                if (editingTask.priority) extra.push('priority'); 
                if (editingTask.tags?.length) extra.push('tags');
                if (editingTask.salesActivity) extra.push('activity_type');
                if (editingTask.notes) extra.push('notes');
                if (editingTask.dealValue) extra.push('deal_value');
                if (editingTask.parentProject) extra.push('project');
                if (editingTask.projectCategory) extra.push('category');
                
                return [...required, ...extra];
            }
            return getRequiredBlocks(taskCategory);
        });

        const [errors, setErrors] = useState({});

        // Handle category change - RESET form data
        const handleCategoryChange = (newCategory) => {
            if (isEditMode) {
                setTaskCategory(newCategory);
                setFormData(prev => ({ ...prev, category: newCategory }));
            } else {
                setTaskCategory(newCategory);
                
                // Reset form data untuk kategori baru
                const baseData = {
                    assignee: { id: "prawd_task", name: "Prawd Task" },
                    
                    tags: []
                };

                if (newCategory === 'content') {
                    setFormData({
                        ...baseData,
                        category: 'content',
                        title: "",
                        description: "",
                        dueDate: "",
                        status: "draft",
                        contentType: "",
                        platforms: [],
                        contentTarget: 'in-house'
                    });
                } else if (newCategory === 'project') {
                    setFormData({
                        ...baseData,
                        category: 'project',
                        title: "",
                        description: "",
                        dueDate: "",
                        status: "todo",
                        parentProject: "",
                        projectCategory: ""
                    });
                } else if (newCategory === 'sales') {
                    setFormData({
                        ...baseData,
                        category: 'sales',
                        contact: "",
                        salesActivity: "",
                        followUpDate: "",
                        dealStage: "lead",
                        dealValue: "",
                        notes: ""
                    });
                }
                
                setActiveBlocks(getRequiredBlocks(newCategory));
                setErrors({});
            }
        };

        // Validation
        const validateForm = () => {
            const newErrors = {};
            
            if (taskCategory === 'sales') {
                if (!formData.contact) newErrors.contact = "Kontak harus dipilih";
                if (!formData.followUpDate) newErrors.followUpDate = "Tanggal follow-up wajib diisi";
            } else {
                if (!formData.title?.trim()) newErrors.title = "Judul wajib diisi";
                if (!formData.dueDate) newErrors.dueDate = "Deadline wajib diisi";
            }
            
            if (!formData.assignee?.id) newErrors.assignee = "PIC wajib dipilih";
            
            setErrors(newErrors);
            return Object.keys(newErrors).length === 0;
        };

        const handleSubmit = (e) => {
            e.preventDefault();
            if (validateForm()) {
                // VALIDATION: Pastikan ada currentWorkspace
                if (!currentWorkspace?.id) {
                    setErrors({ general: 'Please select a workspace first' });
                    return;
                }
                
                const submitData = {
                    ...formData,
                    workspace_id: currentWorkspace.id, // ← TAMBAH BARIS INI
                    category: taskCategory,
                    channel: formData.platforms?.[0] || 'internal',
                    publishDate: formData.dueDate,
                    selectedClient: formData.selectedClient || null,
                };
                
                if (isEditMode) {
                    onSubmit({ ...submitData, id: editingTask.id, updatedAt: new Date().toISOString() });
                } else {
                    onSubmit(submitData);
                    // Reset form after submit
                    const baseData = {
                        assignee: { id: "prawd_task", name: "Prawd Task" },
                        
                        tags: []
                    };
                    setFormData({
                        ...baseData,
                        category: 'content',
                        title: "",
                        description: "",
                        dueDate: "",
                        contentType: "",
                        platforms: []
                    });
                    setTaskCategory('content');
                    setActiveBlocks(getRequiredBlocks('content'));
                    setErrors({});
                }
            }
        };

        const requiredBlocks = getRequiredBlocks(taskCategory);
        const extraOptions = getExtraOptions(taskCategory);
        const availableExtras = extraOptions.filter(option => !activeBlocks.includes(option.id));

        // Add this useEffect after the existing useEffects in CreateContentForm
        useEffect(() => {
            // Auto-update form when sales activity changes untuk user experience
            if (taskCategory === 'sales' && formData.salesActivity) {
                // Optional: Clear existing notes when activity type changes
                // setFormData(prev => ({ ...prev, notes: "" })); 
                
                // Or keep notes but update UI context
                console.log(`Sales activity changed to: ${formData.salesActivity}`);
            }
        }, [formData.salesActivity, taskCategory]);

// Sync currency when editing task - ENHANCED
useEffect(() => {
    if (isEditMode && editingTask) {
        // 1. Prioritas dari dealCurrency field
        if (editingTask.dealCurrency) {
            setCurrency(editingTask.dealCurrency);
        } 
        // 2. Fallback: detect dari dealValue content
        else if (editingTask.dealValue) {
            if (editingTask.dealValue.includes('$')) {
                setCurrency('USD');
            } else if (editingTask.dealValue.includes('Rp')) {
                setCurrency('IDR');
            }
        }
        // 3. Default IDR jika tidak ada petunjuk
        else {
            setCurrency('IDR');
        }
    } else {
        // Reset ke IDR saat create mode
        setCurrency('IDR');
    }
}, [isEditMode, editingTask]);

        return (
            <div className="space-y-3">
                {/* Task Category Selector */}
                {!isEditMode && (
                    <div className="bg-b-semidark rounded-lg pb-3">
                        <div className="grid grid-cols-3 gap-3">
                            {Object.values(TASK_CATEGORIES).map((category) => {
                                const Icon = category.icon;
                                const isActive = taskCategory === category.id;
                                
                                return (
                                    <button
                                        key={category.id}
                                        type="button"
                                        onClick={() => handleCategoryChange(category.id)}
                                        className={`px-2 py-4 flex flex-col items-center justify-center rounded-2xl text-sm gap-2 font-medium transition-colors ${
                                            isActive 
                                                ? 'bg-b-darklight text-t-light' 
                                                : 'bg-b-semidark text-t-mut hover:bg-b-darklight'
                                        }`}
                                    >
                                        <Icon className="w-7 h-7 mx-auto" />
                                        <div className="truncate text-wrap w-50 leading-4">{category.name}</div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-3">
                    {/* Required Blocks */}
                    {requiredBlocks.map((blockId) => (
                        <DynamicFormBlock
                            key={`${taskCategory}-${blockId}`}
                            blockId={blockId}
                            taskCategory={taskCategory}
                            formData={formData}
                            setFormData={setFormData}
                            errors={errors}
                            canRemove={false}
                            currency={currency} 
                            setCurrency={setCurrency} 
                            clients={clients}
                            onNavigateToClient={onNavigateToClient}
                        />
                    ))}

                    {/* Active Extra Blocks */}
                    {activeBlocks
                        .filter(blockId => !requiredBlocks.includes(blockId))
                        .map((blockId) => (
                        <DynamicFormBlock
                            key={`${taskCategory}-extra-${blockId}`}
                            blockId={blockId}
                            taskCategory={taskCategory}
                            formData={formData}
                            setFormData={setFormData}
                            errors={errors}
                            onRemove={() => setActiveBlocks(prev => prev.filter(id => id !== blockId))}
                            canRemove={true}
                            currency={currency}
                            setCurrency={setCurrency}
                            clients={clients}
                            onNavigateToClient={onNavigateToClient}
                        />
                    ))}

                    {/* Add Extra Options */}
                    {availableExtras.length > 0 && (
                        <div>
                            <label className='block text-sm font-medium text-t-mut mb-1'>Extra Options</label>
                            <div className="space-y-2">
                                {availableExtras.map((option) => (
                                    <button
                                        key={option.id}
                                        type="button"
                                        onClick={() => {
                                            setActiveBlocks(prev => [...prev, option.id]);
                                        }}
                                        className="w-full flex items-center justify-between space-x-2 text-left hover:bg-b-semidark text-sm border border-dashed border-borlight rounded-2xl p-3 transition-all duration-200 font-medium transform hover:-translate-y-0.5"
                                    >
                                        <div className="flex items-center gap-2">
                                            <option.icon className="w-4 h-4 text-t-light" />
                                            <span className="text-t-mut">{option.name}</span>
                                        </div>
                                        <Plus className="w-5 h-5 font-bold text-yellow-500 ml-auto" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex space-x-2 pt-3">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="px-3 py-3 text-lg bg-b-darklight hover:bg-b-semidark text-t-light rounded-2xl transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-3 py-3 text-xl bg-b-red-inb font-medium text-t-light rounded-2xl transition-colors"
                        >
                            {isEditMode ? 'Update' : 'Create'}
                        </button>
                    </div>
                </form>
            </div>
        );
    };

    // Helper function untuk dynamic sales notes naming
    const getSalesNotesConfig = (salesActivity) => {
        const configs = {
            'call': {
                label: 'Call Summary',
                placeholder: 'Call summary, key points discussed, decisions made, next steps...'
            },
            'meeting': {
                label: 'Meeting Notes', 
                placeholder: 'Meeting agenda, discussion points, action items, follow-up tasks...'
            },
            'email': {
                label: 'Email Details',
                placeholder: 'Email content summary, client responses, important information...'
            },
            'demo': {
                label: 'Demo Feedback',
                placeholder: 'Demo feedback, client reactions, questions asked, feature requests...'
            },
            'followup': {
                label: 'Follow-up Log',
                placeholder: 'Follow-up activities, client updates, progress notes, next actions...'
            },
            'proposal': {
                label: 'Proposal Notes',
                placeholder: 'Proposal details, client requirements, pricing discussions...'
            },
            'negotiation': {
                label: 'Negotiation Log',
                placeholder: 'Negotiation points, terms discussed, objections, agreements...'
            }
        };
        
        // Default fallback
        return configs[salesActivity] || {
            label: 'Contact Details',
            placeholder: 'Contact information, preferences, important notes, interaction history...'
        };
    };

    // Currency formatting helper
    const formatCurrency = (value, currencyType = 'IDR') => {
        if (!value) return '';
        
        // Remove all non-numeric characters except decimal point
        const numericValue = value.toString().replace(/[^\d.]/g, '');
        const number = parseFloat(numericValue);
        
        if (isNaN(number)) return '';
        
        if (currencyType === 'IDR') {
            // Indonesian Rupiah format: Rp 50.000.000 (dengan spasi)
            return new Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: 'IDR',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            }).format(number).replace('Rp', 'Rp '); // Tambah spasi setelah Rp
        } else if (currencyType === 'USD') {
            // US Dollar format: $50,000,000
            return new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            }).format(number);
        } else if (currencyType === 'SGD') {
            // Singapore Dollar format: S$50,000,000
            return 'S$' + new Intl.NumberFormat('en-SG', {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            }).format(number);
        }
        
        return value; // fallback
    };

    // Parse currency to raw number - SMART PARSING
    const parseCurrency = (formattedValue) => {
        if (!formattedValue) return '';
        
        const str = formattedValue.toString();

        // Handle S$ (Singapore Dollar)
        if (str.includes('S$')) {
            return str.replace(/[^\d.]/g, '');
        }
        
        // Jika mengandung koma, itu pemisah ribuan (format US: 25,000)
        if (str.includes(',')) {
            return str.replace(/[^\d]/g, ''); // Hapus semua non-digit
        }
        
        // Jika mengandung titik dan angka setelahnya >= 3 digit, itu pemisah ribuan (format ID: 25.000)
        const dotIndex = str.lastIndexOf('.');
        if (dotIndex !== -1) {
            const afterDot = str.substring(dotIndex + 1);
            if (afterDot.length >= 3) {
                // Ini pemisah ribuan, bukan desimal
                return str.replace(/[^\d]/g, '');
            }
        }
        
        // Default: hapus semua kecuali digit dan titik terakhir (untuk desimal)
        return str.replace(/[^\d.]/g, '');
    };

    const DynamicFormBlock = ({ 
        blockId, 
        taskCategory, 
        formData, 
        setFormData, 
        errors, 
        onRemove, 
        canRemove,
        currency = 'IDR', 
        setCurrency = () => {},
        clients = [],
        onNavigateToClient = () => {}
    }) => {
        const getBlockContent = () => {
            switch (blockId) {
                // ===== UNIVERSAL WAJIB BLOCKS =====
                case 'title':
                    return (
                        <div className="space-y-3">
                            {/* Content Target Selection - Only for Content */}
                            {taskCategory === 'content' && (
                                <div>
                                    <label className="block text-sm font-medium text-t-mut mb-3">Content Target</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, contentTarget: 'in-house' }))}
                                            className={`p-4 rounded-2xl border-2 transition-colors flex flex-col items-center justify-center space-y-2 ${
                                                formData.contentTarget === 'in-house'
                                                    ? 'border-b-grn bg-b-grn/10 text-t-light'
                                                    : 'border-bor bg-b-darklight text-t-mut hover:border-b-grn hover:bg-b-grn/5'
                                            }`}
                                        >
                                            <div className="w-8 h-8 bg-b-grn/20 rounded-lg flex items-center justify-center">
                                                <Briefcase className="w-4 h-4 text-t-grn" />
                                            </div>
                                            <div className="text-center">
                                                <div className="text-sm font-semibold">In-House</div>
                                            </div>
                                        </button>
                                        
                                        <button
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, contentTarget: 'client' }))}
                                            className={`p-4 rounded-2xl border-2 transition-colors flex flex-col items-center justify-center space-y-2 ${
                                                formData.contentTarget === 'client'
                                                    ? 'border-b-blue bg-b-blue/10 text-t-light'
                                                    : 'border-bor bg-b-darklight text-t-mut hover:border-b-blue hover:bg-b-blue/5'
                                            }`}
                                        >
                                            <div className="w-8 h-8 bg-b-blue/20 rounded-lg flex items-center justify-center">
                                                <Users className="w-4 h-4 text-t-blue" />
                                            </div>
                                            <div className="text-center">
                                                <div className="text-sm font-semibold">Client</div>
                                            </div>
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Client Selection - Only show when content target is 'client' */}
                            {taskCategory === 'content' && formData.contentTarget === 'client' && (
                                <div>
                                    <label className="block text-sm font-medium text-t-mut mb-1">Select Client</label>
                                    {clients.length > 0 ? (
                                    <Dropdown
                                        enableHover={false}
                                        options={clients
                                            .filter(client => client.clientStage === 'client')
                                            .map(client => ({
                                                value: client.id,
                                                label: client.name,
                                                icon: client.customerType === 'business' ? Briefcase : User,
                                                description: client.customerType === 'business' ? 'Business' : 'Personal'
                                            }))
                                        }
                                        value={formData.selectedClient}
                                        onChange={(value) => {
                                            const selectedClient = clients.find(c => c.id === value);
                                            setFormData(prev => ({ 
                                                ...prev, 
                                                selectedClient: value,
                                                // Only auto-fill title if it's empty or in create mode
                                                title: (!prev.title || !prev.id) && selectedClient ? `Content for ${selectedClient.name}` : prev.title
                                            }));
                                        }}
                                        placeholder="Choose client..."
                                        size="sm"
                                    />
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={onNavigateToClient}
                                            className="w-full p-4 border-2 border-dashed border-bor-grn rounded-2xl text-center hover:bg-b-grn/5 transition-colors group"
                                        >
                                            <div className="flex flex-col items-center space-y-2">
                                                <div className="w-10 h-10 bg-b-grn/10 rounded-xl flex items-center justify-center group-hover:bg-b-grn/20 transition-colors">
                                                    <Plus className="w-5 h-5 text-t-grn" />
                                                </div>
                                                <div>
                                                    <div className="text-sm font-medium text-t-light">Tambahkan Client</div>
                                                    <div className="text-xs text-t-mut">No clients available yet</div>
                                                </div>
                                            </div>
                                        </button>
                                    )}
                                </div>
                            )}
                            
                            {/* Title Input */}
                            <Input
                                label={taskCategory === 'project' ? "Nama Tugas" : "Judul"}
                                placeholder={
                                    taskCategory === 'content' ? "Video tutorial Instagram..." :
                                    taskCategory === 'project' ? "Redesign landing page..." :
                                    "Judul tugas..."
                                }
                                value={formData.title || ""}
                                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                error={errors.title}
                                required
                            />
                        </div>
                    );

                case 'contact':
                    return (
                        (() => {
                            const [isManualInput, setIsManualInput] = useState(false);
                            
                            // Reset ke dropdown mode jika formData.contact kosong
                            useEffect(() => {
                                if (!formData.contact) {
                                    setIsManualInput(false);
                                }
                            }, [formData.contact]);
                            
                            return (
                                <div>
                                    <label className="block text-sm font-medium text-t-mut mb-1">Kontak</label>
                                    {!isManualInput ? (
                                        /* Dropdown Mode */
                                        <div className="flex space-x-2">
                                            <div className="flex-1">
                                                <Dropdown
                                                    enableHover={false}
                                                    options={(() => {
                                                        const activeClients = clients.filter(c => c.clientStage === 'client');
                                                        const prospects = clients.filter(c => c.clientStage === 'prospect');
                                                        
                                                        const options = [];
                                                        
                                                        // Active Clients Section
                                                        if (activeClients.length > 0) {
                                                            options.push({
                                                                value: '__header_clients__',
                                                                label: 'ACTIVE CLIENTS',
                                                                disabled: true,
                                                                isHeader: true
                                                            });
                                                            activeClients.forEach(client => {
                                                                options.push({
                                                                    value: client.name,
                                                                    label: client.name,
                                                                    icon: client.customerType === 'business' ? Briefcase : User,
                                                                    description: client.customerType === 'business' ? 'Business Client' : 'Personal Client'
                                                                });
                                                            });
                                                        }
                                                        
                                                        // Prospects Section
                                                        if (prospects.length > 0) {
                                                            if (activeClients.length > 0) {
                                                                options.push({
                                                                    value: '__divider__',
                                                                    label: '',
                                                                    disabled: true,
                                                                    isDivider: true
                                                                });
                                                            }
                                                            options.push({
                                                                value: '__header_prospects__',
                                                                label: 'PROSPECTS',
                                                                disabled: true,
                                                                isHeader: true
                                                            });
                                                            prospects.forEach(client => {
                                                                options.push({
                                                                    value: client.name,
                                                                    label: client.name,
                                                                    icon: Target,
                                                                    description: 'Prospect'
                                                                });
                                                            });
                                                        }
                                                        
                                                        return options;
                                                    })()}
                                                    value={formData.contact}
                                                    onChange={(value) => {
                                                        if (!value.startsWith('__')) { // Skip headers/separators
                                                            setFormData(prev => ({ ...prev, contact: value, title: value }));
                                                        }
                                                    }}
                                                    placeholder="Pilih kontak..."
                                                    size="sm"
                                                />
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setIsManualInput(true);
                                                    setFormData(prev => ({ ...prev, contact: '' }));
                                                }}
                                                className="px-4 py-3 bg-b-grn hover:bg-b-grn-hov text-t-light rounded-2xl transition-colors font-medium flex items-center space-x-2"
                                                title="Add new contact manually"
                                            >
                                                <Plus className="w-5 h-5" />
                                            </button>
                                        </div>
                                    ) : (
                                        /* Manual Input Mode */
                                        <div className="space-y-3">
                                            <div className="flex space-x-2 w-full">
                                                <div className="flex-1 min-w-0">
                                                    <Input
                                                        placeholder="Nama kontak baru..."
                                                        value={formData.contact || ""}
                                                        onChange={(e) => setFormData(prev => ({ 
                                                            ...prev, 
                                                            contact: e.target.value,
                                                            title: e.target.value 
                                                        }))}
                                                        className="w-full"
                                                        containerClassName="w-full"
                                                    />
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setIsManualInput(false);
                                                        setFormData(prev => ({ ...prev, contact: '' }));
                                                    }}
                                                    className="px-4 py-3 bg-b-red-inb hover:bg-b-red-inb-hov text-t-light rounded-2xl transition-colors flex-shrink-0"
                                                    title="Back to dropdown"
                                                >
                                                    <X className="w-5 h-5" />
                                                </button>
                                            </div>
                                            <div className="bg-b-blue/10 border border-b-blue/30 rounded-lg p-3">
                                                <div className="flex items-center space-x-2 text-blue-400 text-sm">
                                                    <Info className="w-4 h-4" />
                                                    <span>
                                                        {formData.dealStage === 'closed' 
                                                            ? 'Will be saved as Active Client' 
                                                            : 'Will be saved as Prospect'
                                                        }
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })()
                    );

                case 'assignee':
                    return (
                        (() => {
                            // Get workspace members sebagai assignee options
                            const assigneeOptions = workspaceMembers.length > 0 
                                ? workspaceMembers.map(member => ({
                                    value: member.id, // email
                                    label: member.name,
                                    icon: Users,
                                    description: member.role,
                                    avatar: member.avatar
                                }))
                                : [
                                    // Fallback ke current user jika tidak ada workspace members
                                    { 
                                        value: window.Laravel?.user?.email || "current_user", 
                                        label: window.Laravel?.user?.name || "You", 
                                        icon: Users 
                                    }
                                ];

                            return (
                                <div>
                                    <label className="block text-sm font-medium text-t-mut mb-1">
                                        {taskCategory === 'sales' ? "Yang Handle" : "Yang Ngerjain"}
                                    </label>
                                    <Dropdown
                                        enableHover={false}
                                        options={assigneeOptions}
                                        value={formData.assignee?.id || assigneeOptions[0]?.value}
                                        onChange={(value) => {
                                            const selectedMember = workspaceMembers.find(member => member.id === value) || {
                                                id: window.Laravel?.user?.email,
                                                name: window.Laravel?.user?.name
                                            };
                                            setFormData(prev => ({ 
                                                ...prev, 
                                                assignee: { id: selectedMember.id, name: selectedMember.name }
                                            }));
                                        }}
                                        placeholder="Pilih PIC"
                                        size="sm"
                                    />
                                </div>
                            );
                        })()
                    );

                case 'deadline':
                    return (
                        <DateTimePicker
                            label="Deadline"
                            value={formData.dueDate}
                            onChange={(value) => setFormData(prev => ({ ...prev, dueDate: value }))}
                            error={errors.dueDate}
                        />
                    );

                case 'followup_date':
                    return (
                        <DateTimePicker
                            label="Kapan Follow-up"
                            value={formData.followUpDate}
                            onChange={(value) => setFormData(prev => ({ ...prev, followUpDate: value, dueDate: value }))}
                            error={errors.dueDate}
                        />
                    );

                // ===== EXTRA OPTIONS =====
                case 'description':
                    return (
                        <div>
                            <label className="block text-sm font-medium text-t-mut mb-1">Deskripsi</label>
                            <textarea
                                value={formData.description || ""} // ← FIX: default ke empty string
                                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                rows={3}
                                className="w-full px-4 py-3 text-base bg-b-darklight text-t-light rounded-lg focus:ring-1 focus:ring-bor-grn resize-none"
                                placeholder="Detail tugas..."
                            />
                        </div>
                    );

                case 'content_type':
                    return (
                        <div>
                            <label className="block text-sm font-medium text-t-mut mb-1">Jenis Konten</label>
                            <Dropdown
                                enableHover={false}
                                options={[
                                    { value: "post", label: "Post", icon: Image },
                                    { value: "video", label: "Video", icon: Video },
                                    { value: "article", label: "Article", icon: FileText },
                                    { value: "email", label: "Email", icon: Mail }
                                ]}
                                value={formData.contentType}
                                onChange={(value) => setFormData(prev => ({ ...prev, contentType: value }))}
                                placeholder="Pilih jenis konten..."
                                size="sm"
                            />
                        </div>
                    );

                case 'platform':
                    return (
                        (() => {
                            const [showAllPlatforms, setShowAllPlatforms] = useState(false);
                            
                            const defaultPlatforms = ['Instagram', 'TikTok', 'YouTube', 'Facebook', 'WhatsApp'];
                            const allPlatforms = [
                                'Instagram', 'TikTok', 'YouTube', 'Facebook', 'WhatsApp',
                                'Twitter', 'Telegram', 'LINE', 'LinkedIn', 'Discord',
                                'Shopee', 'Tokopedia', 'BukaLapak', 'Website', 'Gmail',
                                'Threads'
                            ];
                            
                            const platformsToShow = showAllPlatforms ? allPlatforms : defaultPlatforms;
                            
                            return (
                                <div>
                                    <label className="block text-sm font-medium text-t-mut mb-1">Platform</label>
                                    <div className="flex flex-wrap gap-2">
                                        {platformsToShow.map(platform => (
                                            <button
                                                key={platform}
                                                type="button"
                                                onClick={() => {
                                                    const current = formData.platforms || [];
                                                    const updated = current.includes(platform)
                                                        ? current.filter(p => p !== platform)
                                                        : [...current, platform];
                                                    setFormData(prev => ({ ...prev, platforms: updated }));
                                                }}
                                                className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                                                    (formData.platforms || []).includes(platform)
                                                        ? 'bg-b-grn text-t-light'
                                                        : 'bg-b-darklight text-t-mut hover:bg-b-grn'
                                                }`}
                                            >
                                                {platform}
                                            </button>
                                        ))}
                                        
                                        {/* Plus Button */}
                                        <button
                                            type="button"
                                            onClick={() => setShowAllPlatforms(!showAllPlatforms)}
                                            className="px-3 py-2 text-sm rounded-lg border border-dashed border-borlight text-t-mut hover:border-bor-grn hover:text-t-grn transition-colors flex items-center space-x-1"
                                        >
                                            <Plus className="w-4 h-4" />
                                            <span>{showAllPlatforms ? 'Show Less' : 'More Platforms'}</span>
                                        </button>
                                    </div>
                                </div>
                            );
                        })()
                    );

                case 'status':
                    return (
                        <div>
                            <label className="block text-sm font-medium text-t-mut mb-1">Status</label>
                            <Dropdown
                                enableHover={false}
                                options={(() => {
                                    const categoryConfig = TASK_CATEGORIES[taskCategory.toUpperCase()];
                                    if (!categoryConfig) return [];
                                    
                                    return categoryConfig.workflow.map(status => ({
                                        value: status,
                                        label: categoryConfig.statusLabels[status],
                                        icon: getStatusIcon(status)
                                    }));
                                })()}
                                value={formData.status}
                                onChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
                                placeholder="Pilih status..."
                                size="sm"
                            />
                        </div>
                    );

                case 'priority':
                    return (
                        <div>
                            <label className="block text-sm font-medium text-t-mut mb-1">Priority</label>
                            <Dropdown
                                enableHover={false}
                                options={getPriorityOptions(true)} // Semua category dapat urgent
                                value={formData.priority}
                                onChange={(value) => setFormData(prev => ({ ...prev, priority: value }))}
                                placeholder="Select priority..."
                                size="sm"
                            />
                        </div>
                    );

                case 'tags':
                    return (
                        (() => {
                            const [tagInput, setTagInput] = useState(formData.tags?.join(', ') || '');
                            
                            const handleTagChange = (e) => {
                                setTagInput(e.target.value || ''); // ← FIX
                            };
                            
                            const handleTagBlur = () => {
                                const tags = (tagInput || '').split(',').map(tag => tag.trim()).filter(Boolean);
                                setFormData(prev => ({ ...prev, tags }));
                            };
                            
                            return (
                                <Input
                                    label="Tag"
                                    placeholder="Pisah dengan koma: urgent, client, q4..."
                                    value={tagInput}
                                    onChange={handleTagChange}
                                    onBlur={handleTagBlur}
                                />
                            );
                        })()
                    );

                // Sales specific blocks
                case 'activity_type':
                    return (
                        <div>
                            <label className="block text-sm font-medium text-t-mut mb-1">Jenis Aktivitas</label>
                            <Dropdown
                                enableHover={false}
                                options={[
                                    { value: "call", label: "Call", icon: Phone },
                                    { value: "meeting", label: "Meeting", icon: Users },
                                    { value: "email", label: "Email", icon: Mail },
                                    { value: "demo", label: "Demo", icon: PlayCircle },
                                    { value: "followup", label: "Follow-up", icon: RefreshCw },
                                    { value: "proposal", label: "Proposal", icon: FileText },
                                    { value: "negotiation", label: "Negotiation", icon: MessageSquare }
                                ]}
                                value={formData.salesActivity}
                                onChange={(value) => setFormData(prev => ({ ...prev, salesActivity: value }))}
                                placeholder="Pilih aktivitas..."
                                size="sm"
                            />
                        </div>
                    );

                case 'deal_stage':
                    return (
                        <div>
                            <label className="block text-sm font-medium text-t-mut mb-1">Tahap Deal</label>
                            <Dropdown
                                enableHover={false}
                                options={[
                                    { value: "lead", label: "Lead", icon: Target },
                                    { value: "qualified", label: "Qualified", icon: CheckCircle2 },
                                    { value: "proposal", label: "Proposal", icon: FileText },
                                    { value: "negotiation", label: "Negosiasi", icon: MessageSquare },
                                    { value: "closed", label: "Closed", icon: Star }
                                ]}
                                value={formData.dealStage}
                                onChange={(value) => setFormData(prev => ({ ...prev, dealStage: value }))}
                                placeholder="Pilih tahap deal..."
                                size="sm"
                            />
                        </div>
                    );

                case 'notes':
                    return (
                        (() => {
                            const notesConfig = taskCategory === 'sales' 
                                ? getSalesNotesConfig(formData.salesActivity)
                                : {
                                    label: 'Notes',
                                    placeholder: 'Additional notes, important information...'
                                };
                            
                            // Get icon based on activity
                            const getActivityIcon = (activity) => {
                                const iconMap = {
                                    'call': Phone,
                                    'meeting': Users,
                                    'email': Mail,
                                    'demo': PlayCircle,
                                    'followup': RefreshCw,
                                    'proposal': FileText,
                                    'negotiation': MessageSquare
                                };
                                return iconMap[activity] || Edit3;
                            };
                            
                            const ActivityIcon = formData.salesActivity ? getActivityIcon(formData.salesActivity) : Edit3;
                            
                            return (
                                <div>
                                    <label className="text-sm font-medium text-t-mut mb-1 flex items-center gap-2">
                                        <ActivityIcon className="w-4 h-4" />
                                        {notesConfig.label}
                                        {formData.salesActivity && (
                                            <span className="text-xs px-2 py-1 bg-b-acc text-t-acc rounded-full">
                                                {formData.salesActivity}
                                            </span>
                                        )}
                                    </label>
                                    <textarea
                                        value={formData.notes || ""}
                                        onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                                        rows={3}
                                        className="w-full px-4 py-3 text-base bg-b-darklight text-t-light rounded-2xl focus:ring-1 focus:ring-bor-grn resize-none"
                                        placeholder={notesConfig.placeholder}
                                    />
                                </div>
                            );
                        })()
                    );

                case 'deal_value':
                    return (
                        (() => {
                            // Local state untuk raw input
                            const [localValue, setLocalValue] = React.useState('');
                            
                            // DETEKSI CURRENCY DARI formData.dealValue
                            const detectCurrency = (dealValue) => {
                                if (!dealValue) return currency;
                                if (dealValue.includes('S$')) return 'SGD';
                                if (dealValue.includes('$')) return 'USD';
                                if (dealValue.includes('Rp')) return 'IDR';
                                return currency;
                            };

                            // Initialize local value dan sync currency
                            React.useEffect(() => {
                                if (formData.dealValue && !localValue) { // Hanya jika localValue masih kosong
                                    const raw = parseCurrency(formData.dealValue);
                                    setLocalValue(raw);
                                    
                                    // SYNC CURRENCY dengan formData
                                    const detectedCurrency = detectCurrency(formData.dealValue);
                                    if (detectedCurrency !== currency) {
                                        setCurrency(detectedCurrency);
                                    }
                                }
                            }, [formData.dealValue]); // Hapus dependency localValue

                            // CURRENT CURRENCY berdasarkan detection
                            const currentCurrency = detectCurrency(formData.dealValue) || currency;

                            return (
                                <div>
                                    <label className="block text-sm font-medium text-t-mut mb-1">Nilai Deal</label>
                                    <div className="flex space-x-2">
                                        {/* Currency Cycle Button */}
                                        <button
                                            type="button"
                                            onClick={() => {
                                                // Cycle: IDR → USD → SGD → IDR
                                                const currencyOrder = ['IDR', 'USD', 'SGD'];
                                                const currentIndex = currencyOrder.indexOf(currentCurrency);
                                                const nextIndex = (currentIndex + 1) % currencyOrder.length;
                                                const newCurrency = currencyOrder[nextIndex];
                                                
                                                setCurrency(newCurrency);
                                                
                                                // Update formData dengan currency baru
                                                if (localValue) {
                                                    const newFormatted = formatCurrency(localValue, newCurrency);
                                                    setFormData(prev => ({ 
                                                        ...prev, 
                                                        dealValue: newFormatted,
                                                        dealCurrency: newCurrency 
                                                    }));
                                                } else {
                                                    setFormData(prev => ({ 
                                                        ...prev, 
                                                        dealCurrency: newCurrency 
                                                    }));
                                                }
                                            }}
                                            className={`px-3 py-3 min-w-[60px] rounded-xl text-sm font-medium transition-all duration-200 flex justify-center items-center space-x-1 ${
                                                currentCurrency === 'USD' ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30' :
                                                currentCurrency === 'SGD' ? 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30' :
                                                'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                                            }`}
                                            title={`Click to cycle: IDR → USD → SGD`}
                                        >
                                            <span className="text-sm font-bold">
                                                {currentCurrency === 'USD' ? '$' : 
                                                currentCurrency === 'SGD' ? 'S$' : 'Rp'}
                                            </span>
                                        </button>
                                        
                                        {/* Input Field */}
                                        <div className="flex-1">
                                            <input
                                                type="text"
                                                placeholder={
                                                    currentCurrency === 'IDR' ? '50000000' : 
                                                    currentCurrency === 'SGD' ? '50000' : '50000'
                                                }
                                                value={localValue}
                                                onChange={(e) => {
                                                    const rawValue = e.target.value.replace(/[^\d.]/g, '');
                                                    setLocalValue(rawValue);
                                                }}
                                                onBlur={() => {
                                                    if (localValue) {
                                                        const formatted = formatCurrency(localValue, currentCurrency);
                                                        setFormData(prev => ({ 
                                                            ...prev, 
                                                            dealValue: formatted,
                                                            dealCurrency: currentCurrency
                                                        }));
                                                    } else {
                                                        setFormData(prev => ({ 
                                                            ...prev, 
                                                            dealValue: '',
                                                            dealCurrency: currentCurrency
                                                        }));
                                                    }
                                                }}
                                                className="w-full px-4 py-3 text-base bg-b-darklight text-t-light rounded-xl focus:ring-1 focus:ring-bor-grn"
                                            />
                                        </div>
                                    </div>
                                </div>
                            );
                        })()
                    );

                // Project specific blocks
                case 'project':
                    return (
                        <div>
                            <label className="block text-sm font-medium text-t-mut mb-1">Proyek</label>
                            <Dropdown
                                enableHover={false}
                                options={[
                                    { value: "website_redesign", label: "Website Redesign Q4", icon: Globe },
                                    { value: "mobile_app", label: "Mobile App Development", icon: Smartphone },
                                    { value: "brand_campaign", label: "Brand Campaign 2024", icon: TrendingUp },
                                    { value: "system_upgrade", label: "System Upgrade", icon: Settings }
                                ]}
                                value={formData.parentProject}
                                onChange={(value) => setFormData(prev => ({ ...prev, parentProject: value }))}
                                placeholder="Pilih proyek..."
                                size="sm"
                            />
                        </div>
                    );

                case 'category':
                    return (
                        <div>
                            <label className="block text-sm font-medium text-t-mut mb-1">Kategori</label>
                            <Dropdown
                                enableHover={false}
                                options={[
                                    { value: "development", label: "Development", icon: Monitor },
                                    { value: "marketing", label: "Marketing", icon: TrendingUp },
                                    { value: "operational", label: "Operasional", icon: Settings }
                                ]}
                                value={formData.projectCategory}
                                onChange={(value) => setFormData(prev => ({ ...prev, projectCategory: value }))}
                                placeholder="Pilih kategori..."
                                size="sm"
                            />
                        </div>
                    );

                default:
                    return <div className="text-xs text-t-light">Block coming soon...</div>;
            }
        };

        return (
            <div className="bg-b-semidark rounded-lg group">
                <div className="space-y-3 relative">
                    {canRemove && (
                        <button
                            onClick={onRemove}
                            className="group absolute top-0.5 right-0 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <X className="w-4 h-4 text-t-light hover:text-t-light transition-transform duration-300 ease-in-out group-hover:rotate-90" />
                        </button>
                    )}
                    {getBlockContent()}
                </div>
            </div>
        );
    };

    const ShortcutsModal = () => {
        const shortcuts = [
            { key: "⌘K / Ctrl+K", description: "Quick search" },
            { key: "⌘N / Ctrl+N", description: "Create new content" },
            { key: "⌘B / Ctrl+B", description: "Toggle sidebar" },
            { key: "⌘E / Ctrl+E", description: "Toggle calendar expand" },
            { key: "⌘T / Ctrl+T", description: "Go to today" },
            { key: "← →", description: "Navigate day/month" },
            { key: "Shift + ← →", description: "Navigate day only" },
            { key: "Ctrl + ← →", description: "Navigate month only" },
            { key: "⌘/ / Ctrl+/", description: "Show shortcuts" },
            { key: "Escape", description: "Close modals" },
        ];

        return (
            <Modal
                isOpen={isShortcutsModalOpen}
                onClose={() => setIsShortcutsModalOpen(false)}
                title="Keyboard Shortcuts"
                size="sm"
            >
                <div className="space-y-4">
                    {shortcuts.map((shortcut, index) => (
                        <div
                            key={index}
                            className="flex items-center justify-between py-2"
                        >
                            <span className="text-t-light">
                                {shortcut.description}
                            </span>
                            <kbd className="px-3 py-1 bg-b-darklight rounded-lg text-sm font-mono text-t-mut border border-borlight">
                                {shortcut.key}
                            </kbd>
                        </div>
                    ))}
                </div>
            </Modal>
        );
    };

    // Fetch holidays from Google Calendar API
    const fetchHolidays = async (year) => {
        if (!import.meta.env.VITE_GOOGLE_CALENDAR_API_KEY) {
            console.warn('Google Calendar API key not found');
            return [];
        }

        try {
            setLoadingHolidays(true);
            
            // Indonesia public holidays calendar ID
            const calendarId = 'en.indonesian%23holiday%40group.v.calendar.google.com';
            const apiKey = import.meta.env.VITE_GOOGLE_CALENDAR_API_KEY;
            
            const timeMin = `${year}-01-01T00:00:00Z`;
            const timeMax = `${year}-12-31T23:59:59Z`;
            
            const url = `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events?key=${apiKey}&timeMin=${timeMin}&timeMax=${timeMax}&singleEvents=true&orderBy=startTime`;
            
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            const formattedHolidays = data.items.map(event => ({
                id: event.id,
                summary: event.summary,
                date: new Date(event.start.date + 'T00:00:00'),
                description: event.description || '',
                type: 'holiday'
            }));
            
            return formattedHolidays;
        } catch (error) {
            console.error('Error fetching holidays:', error);
            addToast('Failed to load holidays', 'error');
            return [];
        } finally {
            setLoadingHolidays(false);
        }
    };

    useEffect(() => {
        const year = currentDate.getFullYear();
        fetchHolidays(year).then((holidayData) => {
            setHolidays(holidayData);
        });
    }, [currentDate.getFullYear()]);

    const renderClientSection = (sectionClients, sectionTitle, sectionIcon, sectionColor) => {
        if (sectionClients.length === 0) return null;
        
        const IconComponent = sectionIcon;
        
        return (
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <h4 className={`text-sm font-semibold ${sectionColor} flex items-center space-x-2`}>
                        <IconComponent className="w-4 h-4" />
                        <span>{sectionTitle} ({sectionClients.length})</span>
                    </h4>
                </div>
                <div className="space-y-2 overflow-y-auto custom-scrollbar">
                    {sectionClients.map((client) => {
                        const isExpanded = expandedClientId === client.id;

                        // PROSPECT: Tampilan sederhana tanpa accordion
                        if (client.clientStage === 'prospect') {
                            const isEditingName = editingClientName === client.id;
                            
                            return (
                                <div key={client.id} className="bg-b-closedark rounded-2xl p-4">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 bg-b-blue/20 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <Target className="w-5 h-5 text-t-blue" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            {isEditingName ? (
                                                // Mode Edit: Input field
                                                <div className="space-y-1">
                                                    <input
                                                        type="text"
                                                        value={editNameValue}
                                                        onChange={(e) => setEditNameValue(e.target.value)}
                                                        className="w-full px-2 py-1 text-sm bg-b-semidark text-t-light rounded border border-bor focus:border-b-blue focus:outline-none"
                                                        autoFocus
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter') {
                                                                // Save
                                                                handleSaveClientName(client.id, editNameValue);
                                                            } else if (e.key === 'Escape') {
                                                                // Cancel
                                                                setEditingClientName(null);
                                                                setEditNameValue('');
                                                            }
                                                        }}
                                                    />
                                                    <div className="flex space-x-1">
                                                        <button
                                                            onClick={() => handleSaveClientName(client.id, editNameValue)}
                                                            className="px-2 py-0.5 text-xs bg-b-grn hover:bg-b-grn-hov text-white rounded"
                                                        >
                                                            Save
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                setEditingClientName(null);
                                                                setEditNameValue('');
                                                            }}
                                                            className="px-2 py-0.5 text-xs bg-b-darklight hover:bg-b-semidark text-t-light rounded"
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                // Mode Normal: Nama biasa
                                                <>
                                                    <h4 className="font-medium text-t-light truncate">{client.name}</h4>
                                                    <div className="text-xs text-t-mut">Prospect</div>
                                                </>
                                            )}
                                        </div>
                                        {!isEditingName && (
                                            <div className="flex items-center space-x-1">
                                                {/* Icon Edit */}
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setEditingClientName(client.id);
                                                        setEditNameValue(client.name);
                                                    }}
                                                    className="p-2 text-t-blue hover:text-blue-400 rounded-lg transition-colors"
                                                    title="Edit name"
                                                >
                                                    <Edit3 className="w-4 h-4" />
                                                </button>
                                                {/* Icon Delete */}
                                                <button
                                                    onClick={async (e) => {
                                                        e.stopPropagation();
                                                        if (confirm(`Delete prospect "${client.name}"?`)) {
                                                            try {
                                                                await clientApi.deleteClient(client.id);
                                                                setClients(prev => prev.filter(c => c.id !== client.id));
                                                                addToast('Prospect deleted successfully', 'success');
                                                            } catch (error) {
                                                                addToast(error.message, 'error');
                                                            }
                                                        }
                                                    }}
                                                    className="p-2 text-t-red hover:text-t-red rounded-lg transition-colors"
                                                    title="Delete prospect"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        }

                        return (
                            <div key={client.id} className="bg-b-closedark rounded-2xl overflow-hidden transition-all duration-200">
                                {/* Accordion Header - Clickable */}
                                <div 
                                    className="p-4 hover:bg-b-darklight transition-colors cursor-pointer"
                                    onClick={() => {
                                        setExpandedClientId(isExpanded ? null : client.id);
                                    }}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3 min-w-0 flex-1">
                                            <div className="w-10 h-10 bg-b-blue/20 rounded-lg flex items-center justify-center flex-shrink-0 relative">
                                                {(() => {
                                                    // Cari task aktif untuk client ini
                                                    const clientTasks = contents.filter(task => 
                                                        task.client_id === client.id && 
                                                        !['published', 'done', 'completed', 'selesai', 'closed'].includes(task.status)
                                                    );
                                                    
                                                    // Ambil kategori unik
                                                    const uniqueCategories = [...new Set(clientTasks.map(task => task.category))];
                                                    
                                                    if (uniqueCategories.length === 0) {
                                                        // Fallback ke icon original jika tidak ada task aktif
                                                        return client.customerType === 'business' ? (
                                                            <Briefcase className="w-5 h-5 text-t-blue" />
                                                        ) : (
                                                            <User className="w-5 h-5 text-t-blue" />
                                                        );
                                                    } else if (uniqueCategories.length === 1) {
                                                        // Satu kategori - tampilkan icon kategori tersebut
                                                        const category = uniqueCategories[0];
                                                        const categoryConfig = TASK_CATEGORIES[category.toUpperCase()];
                                                        const Icon = categoryConfig?.icon || FileText;
                                                        return <Icon className="w-5 h-5 text-t-blue" />;
                                                    } else if (uniqueCategories.length === 2) {
                                                        // Dua kategori - tampilkan 2 icon kecil
                                                        return (
                                                            <div className="flex space-x-0.5">
                                                                {uniqueCategories.slice(0, 2).map(category => {
                                                                    const categoryConfig = TASK_CATEGORIES[category.toUpperCase()];
                                                                    const Icon = categoryConfig?.icon || FileText;
                                                                    return (
                                                                        <Icon key={category} className="w-3 h-3 text-t-blue" />
                                                                    );
                                                                })}
                                                            </div>
                                                        );
                                                    } else {
                                                        // 3+ kategori - tampilkan 2 icon + counter
                                                        return (
                                                            <div className="flex flex-col items-center space-y-0.5">
                                                                <div className="flex space-x-0.5">
                                                                    {uniqueCategories.slice(0, 2).map(category => {
                                                                        const categoryConfig = TASK_CATEGORIES[category.toUpperCase()];
                                                                        const Icon = categoryConfig?.icon || FileText;
                                                                        return (
                                                                            <Icon key={category} className="w-2.5 h-2.5 text-t-blue" />
                                                                        );
                                                                    })}
                                                                </div>
                                                                <div className="text-xs font-bold text-t-blue">
                                                                    +{uniqueCategories.length - 2}
                                                                </div>
                                                            </div>
                                                        );
                                                    }
                                                })()}
                                                
                                                {/* Indicator jumlah task aktif */}
                                                {(() => {
                                                    const activeTaskCount = contents.filter(task => 
                                                        task.client_id === client.id && 
                                                        !['published', 'done', 'completed', 'selesai', 'closed'].includes(task.status)
                                                    ).length;
                                                    
                                                    return activeTaskCount > 0 && (
                                                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-t-grn rounded-full flex items-center justify-center">
                                                            <span className="text-xs text-white font-bold">
                                                                {activeTaskCount > 9 ? '9+' : activeTaskCount}
                                                            </span>
                                                        </div>
                                                    );
                                                })()}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <h4 className="font-medium text-t-light truncate">{client.name}</h4>
                                                <div className="flex items-center space-x-2 text-xs text-t-mut">
                                                    <span>{client.customerType === 'business' ? 'Business' : 'Personal'}</span>
                                                    {client.clientStage === 'client' && (
                                                        <>
                                                            <span>•</span>
                                                            <span className={`px-1.5 py-0.5 rounded-full ${
                                                                client.status === 'active' ? 'bg-green-500/20 text-green-400' :
                                                                client.status === 'inactive' ? 'bg-yellow-500/20 text-yellow-400' :
                                                                'bg-red-500/20 text-t-red-badge'
                                                            }`}>
                                                                {client.status}
                                                            </span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Expand/Collapse Icon */}
                                        <ChevronDown className={`w-5 h-5 text-t-mut transition-transform duration-200 ${
                                            isExpanded ? 'rotate-180' : ''
                                        }`} />
                                    </div>
                                </div>

                                {/* Accordion Content - Expandable */}
                                <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
                                    isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                                }`}>
                                    <div className="px-4 pb-4 border-t border-bor">
                                        <div className="pt-4 space-y-3">
                                            {client.clientStage === 'client' ? (
                                                // ACTIVE CLIENT - Show Full Details
                                                <>
                                                    {/* Contact Information */}
                                                    <div className="grid grid-cols-1 gap-3">
                                                        <div className="bg-b-semidark rounded-lg p-3">
                                                            <div className="space-y-2">
                                                                <div className="flex items-center justify-between">
                                                                    <span className="text-xs text-t-mut flex items-center space-x-1">
                                                                        <Phone className="w-3 h-3" />
                                                                        <span>Phone</span>
                                                                    </span>
                                                                    <span className="text-sm text-t-light font-medium">{client.phoneNumber}</span>
                                                                </div>
                                                                <div className="flex items-center justify-between">
                                                                    <span className="text-xs text-t-mut flex items-center space-x-1">
                                                                        <Mail className="w-3 h-3" />
                                                                        <span>Email</span>
                                                                    </span>
                                                                    <span className="text-sm text-t-light font-medium truncate">{client.email}</span>
                                                                </div>
                                                                <div className="flex items-start justify-between">
                                                                    <span className="text-xs text-t-mut flex items-center space-x-1">
                                                                        <MapPin className="w-3 h-3" />
                                                                        <span>Address</span>
                                                                    </span>
                                                                    <span className="text-sm text-t-light text-right max-w-48">{client.address}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Additional Information */}
                                                    <div className="grid grid-cols-2 gap-2">
                                                        {client.industry && (
                                                            <div className="bg-b-semidark rounded-lg p-2 text-center">
                                                                <div className="text-xs text-t-mut">Industry</div>
                                                                <div className="text-sm text-t-light font-medium">{client.industry}</div>
                                                            </div>
                                                        )}
                                                        {client.joinedDate && (
                                                            <div className="bg-b-semidark rounded-lg p-2 text-center">
                                                                <div className="text-xs text-t-mut">Joined</div>
                                                                <div className="text-sm text-t-light font-medium">
                                                                    {new Date(client.joinedDate).toLocaleDateString()}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Quick Edit Dropdowns for Active Clients */}
                                                    <div className="grid grid-cols-2 gap-2 text-xs">
                                                        <div onClick={(e) => e.stopPropagation()}>
                                                            <Dropdown
                                                                enableHover={false}
                                                                options={[
                                                                    { value: 'one-off', label: 'One-off', icon: Zap },
                                                                    { value: 'ongoing', label: 'Ongoing', icon: RefreshCw }
                                                                ]}
                                                                value={client.contractType}
                                                                onChange={async (value) => {
                                                                    try {
                                                                        const updatedClient = await clientApi.updateClient(client.id, { contract_type: value });
                                                                        setClients(prev => prev.map(c => c.id === client.id ? updatedClient : c));
                                                                        addToast('Contract type updated', 'success');
                                                                    } catch (error) {
                                                                        addToast('Failed to update contract type', 'error');
                                                                    }
                                                                }}
                                                                className="min-w-0"
                                                                customTrigger={(isOpen) => (
                                                                    <button className={`group/contract w-full px-2 py-1 rounded-md text-xs font-medium cursor-pointer transition-all duration-200 flex items-center justify-between ${
                                                                        !client.contractType 
                                                                            ? 'bg-gray-500/20 text-gray-400 hover:bg-gray-500/30' 
                                                                            : 'bg-b-darklight text-t-light hover:bg-b-acc'
                                                                    }`}>
                                                                        <span className="truncate">{client.contractType || 'Contract'}</span>
                                                                        <ChevronDown className={`w-3 h-3 opacity-75 group-hover/contract:opacity-100 transition-opacity ${isOpen ? 'rotate-180 opacity-100' : ''}`} />
                                                                    </button>
                                                                )}
                                                            />
                                                        </div>

                                                        <div onClick={(e) => e.stopPropagation()}>
                                                            <Dropdown
                                                                enableHover={false}
                                                                options={[
                                                                    { value: 'active', label: 'Active', icon: CheckCircle2 },
                                                                    { value: 'inactive', label: 'Inactive', icon: Circle },
                                                                    { value: 'churned', label: 'Churned', icon: X }
                                                                ]}
                                                                value={client.status}
                                                                onChange={async (value) => {
                                                                    try {
                                                                        const updatedClient = await clientApi.updateClient(client.id, { status: value });
                                                                        setClients(prev => prev.map(c => c.id === client.id ? updatedClient : c));
                                                                        addToast('Status updated', 'success');
                                                                    } catch (error) {
                                                                        addToast('Failed to update status', 'error');
                                                                    }
                                                                }}
                                                                className="min-w-0"
                                                                customTrigger={(isOpen) => (
                                                                    <button className={`group/status w-full px-2 py-1 rounded-md text-xs font-medium cursor-pointer transition-all duration-200 flex items-center justify-between ${
                                                                        client.status === 'active' ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30' :
                                                                        client.status === 'inactive' ? 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30' :
                                                                        'bg-red-500/20 text-t-red-badge hover:bg-red-500/30'
                                                                    }`}>
                                                                        <span className="truncate">{client.status}</span>
                                                                        <ChevronDown className={`w-3 h-3 opacity-75 group-hover/status:opacity-100 transition-opacity ${isOpen ? 'rotate-180 opacity-100' : ''}`} />
                                                                    </button>
                                                                )}
                                                            />
                                                        </div>
                                                    </div>
                                                </>
                                            ) : (
                                                // PROSPECT - Show Minimal Info Only
                                                <div className="bg-b-blue/5 border border-b-blue/20 rounded-xl p-4 text-center">
                                                    <div className="flex items-center justify-center space-x-2 mb-2">
                                                        <Target className="w-5 h-5 text-t-blue" />
                                                        <span className="text-sm font-semibold text-t-blue">Prospect Status</span>
                                                    </div>
                                                    <p className="text-xs text-t-mut leading-relaxed">
                                                        This contact is currently a prospect. Complete a sales deal to convert to active client and access full contact management features.
                                                    </p>
                                                </div>
                                            )}

                                            {/* Action Buttons */}
                                            <div className="flex space-x-2 pt-2">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setEditingClient(client);
                                                        setClientFormMode('edit');
                                                    }}
                                                    className="flex-1 px-3 py-2 bg-b-blue hover:bg-blue-600 text-t-light rounded-lg transition-colors font-medium flex items-center justify-center space-x-2"
                                                >
                                                    <Edit3 className="w-4 h-4" />
                                                    <span>Edit</span>
                                                </button>
                                                <button
                                                    onClick={async (e) => {
                                                        e.stopPropagation();
                                                        if (confirm(`Delete ${client.clientStage} "${client.name}"?`)) {
                                                            try {
                                                                await clientApi.deleteClient(client.id);
                                                                setClients(prev => prev.filter(c => c.id !== client.id));
                                                                setExpandedClientId(null);
                                                                addToast(`${client.clientStage === 'client' ? 'Client' : 'Prospect'} deleted successfully`, 'success');
                                                            } catch (error) {
                                                                addToast(error.message, 'error');
                                                            }
                                                        }
                                                    }}
                                                    className="flex-1 px-3 py-2 bg-b-red hover:bg-red-600 text-t-light rounded-lg transition-colors font-medium flex items-center justify-center space-x-2"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                    <span>Delete</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    const handleSaveClientName = async (clientId, newName) => {
        if (!newName.trim()) {
            addToast('Name cannot be empty', 'error');
            return;
        }
        
        try {
            const updatedClient = await clientApi.updateClient(clientId, { name: newName.trim() });
            setClients(prev => prev.map(c => c.id === clientId ? updatedClient : c));
            setEditingClientName(null);
            setEditNameValue('');
            addToast('Prospect name updated successfully', 'success');
        } catch (error) {
            addToast('Failed to update name: ' + error.message, 'error');
        }
    };

    return (
        <ErrorBoundary>
            <div className="min-h-screen flex flex-col lg:flex-row bg-b-dark">
                {/* Mobile Header */}
                <div className="lg:hidden bg-b-semidark border-b border-borlight px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-bor-grn to-bor-grn rounded-lg flex items-center justify-center">
                            <Swords className="w-5 h-5 text-t-light" />
                        </div>
                        <span className="font-bold text-lg text-t-light">
                            ContentPlanner
                        </span>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                        {/* Mobile User Avatar */}
                        <button 
                            onClick={() => setIsSettingsModalOpen(true)}
                            className="relative"
                        >
                            <Avatar 
                                name={window.Laravel?.user?.name || 'User'} 
                                size="md" 
                                src={window.Laravel?.user?.avatar}
                            />
                            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-b-grn border-2 border-b-semidark rounded-full"></div>
                        </button>
                        
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="p-2 hover:bg-b-darklight rounded-lg transition-colors"
                        >
                            <Menu className="w-5 h-5 text-t-mut" />
                        </button>
                    </div>
                </div>

                {/* Left Sidebar */}
                <div
                    className={`w-[120px] ${
                        isMobileMenuOpen ? "block" : "hidden"
                    } lg:flex flex-col bg-b-semidark relative transition-all duration-300 shadow-xl lg:fixed lg:top-6 lg:left-6 lg:bottom-6 lg:z-30 lg:rounded-2xl overflow-hidden`}
                >
                    {/* Logo - Desktop */}
                    <div className="hidden lg:block py-8">
                        <div className="group flex items-center flex-col justify-center cursor-pointer text-t-mut">
                            {/* Origami Icon */}
                            <Origami size={35} strokeWidth={1} className="  mb-1.5 group-hover:animate-bounce" />

                            {/* Logo Text */}
                            <h1 className="leading-none text-base font-semibold uppercase">
                                Prawd
                            </h1>
                            <span className="tracking-widest text-[9px] uppercase">
                                Task Magic
                            </span>
                        </div>
                    </div>

                    {/* Navigation Section - Flex Grow */}
                    <div 
                        ref={navigationRef}
                        className={`flex flex-1 flex-col items-center justify-start p-4 space-y-6 overflow-y-auto ${hasScroll ? 'mb-20' : ''}`}
                    >
                        {/* Main Menu Icons */}
                        <div className="space-y-6">
                            {[
                                {
                                    id: "dashboard",
                                    label: "Dashboard",
                                    icon: Zap,
                                    activeColor: "text-t-yel",
                                    hoverColor: "hover:text-t-yel",
                                },
                                {
                                    id: "tasks",
                                    label: "Task Manager",
                                    icon: Layers2,
                                    activeColor: "text-t-grn",
                                    hoverColor: "hover:text-t-grn",
                                },
                            ].map((nav) => (
                                <button
                                    key={nav.id}
                                    onClick={() => {
                                        setActiveView(nav.id);
                                        setIsMobileMenuOpen(false);
                                    }}
                                    onMouseEnter={(e) => {
                                        const rect = e.currentTarget.getBoundingClientRect();
                                        setTooltipData({
                                            visible: true,
                                            text: nav.label,
                                            x: rect.right + 8,
                                            y: rect.top + (rect.height / 2)
                                        });
                                    }}
                                    onMouseLeave={() => setTooltipData({ ...tooltipData, visible: false })}
                                    className={`flex items-center justify-center p-4 rounded-2xl transition-all duration-200 group ${
                                        activeView === nav.id
                                            ? `bg-b-acc ${nav.activeColor}`
                                            : `text-t-light hover:bg-b-acc ${nav.hoverColor}`
                                    }`}
                                >
                                    <nav.icon className="w-7 h-7" />
                                </button>
                            ))}
                            
                            {/* Category Icons - Muncul saat Task Manager aktif */}
                            {activeView === "tasks" && (
                                <>
                                    {/* Sub Categories Indicator */}
                                    <div className="flex justify-center py-1">
                                        <div className="flex items-center space-x-1">
                                            <div className="w-1 h-1 bg-t-mut/40 rounded-full"></div>
                                            <div className="w-1 h-1 bg-t-mut/60 rounded-full"></div>
                                            <div className="w-1 h-1 bg-t-mut/40 rounded-full"></div>
                                        </div>
                                    </div>
                                    
                                    {/* Category Icons */}
                                    {[
                                        { id: 'all', name: 'All Tasks', icon: Hash, count: contents.length },
                                        ...Object.values(TASK_CATEGORIES).map(cat => ({
                                            id: cat.id,
                                            name: cat.name,
                                            icon: cat.icon,
                                        }))
                                    ].map((category) => {
                                        const Icon = category.icon;
                                        const isSelected = selectedCategory === category.id;
                                        
                                        return (
                                            <div key={category.id} className="relative flex justify-center group">
                                                <button
                                                    onClick={() => setSelectedCategory(category.id)}
                                                    onMouseEnter={(e) => {
                                                        const rect = e.currentTarget.getBoundingClientRect();
                                                        setTooltipData({
                                                            visible: true,
                                                            text: category.name,
                                                            x: rect.right + 8, // 8px margin dari button
                                                            y: rect.top + (rect.height / 2) // Center vertikal
                                                        });
                                                    }}
                                                    onMouseLeave={() => setTooltipData({ ...tooltipData, visible: false })}
                                                    className={`flex items-center justify-center p-3 rounded-xl transition-all duration-200 ${
                                                        isSelected
                                                            ? "bg-b-acc text-t-grn"
                                                            : "text-t-mut hover:bg-b-acc hover:text-t-grn"
                                                    }`}
                                                >
                                                    <Icon className="w-6 h-6" />
                                                </button>
                                            </div>
                                        );
                                    })}
                                </>
                            )}
                        </div>

                        {/* Separator Line */}
                        <div className="w-12 h-px bg-bor"></div>

                        {/* Current Workspace Members */}
                        <div className="space-y-10">
                            {/* Workspace Label */}
                            <div className="text-center">
                                <p className="text-xs font-semibold text-t-light/50 uppercase tracking-wide">
                                    {currentWorkspace ? 'Member' : ''}
                                </p>
                            </div>

                            {/* Workspace Member Avatars */}
                            <div className="space-y-6">
                                {workspaceMembers.slice(0, 6).map((member, index) => (
                                    <div 
                                        key={member.id}
                                        className="relative group flex justify-center"
                                        title={`${member.name} - ${member.role}`}
                                    >
                                        {/* Main Avatar Container */}
                                        <div className="relative">
                                            {/* Avatar */}
                                            <div className="w-10 h-10 rounded-xl overflow-hidden transition-colors duration-200">
                                                <Avatar 
                                                    name={member.name} 
                                                    size="lg" 
                                                    src={member.avatar}
                                                />
                                            </div>
                                            
                                            {/* Online Status - Only if actually online */}
                                            {(() => {
                                                // Check if user is actually online
                                                const isCurrentUser = member.id === window.Laravel?.user?.email;
                                                const isOnline = isCurrentUser; // Current user = online, others = offline
                                                
                                                return isOnline && (
                                                    <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-t-grn border-2 border-b-semidark rounded-full shadow-sm"></div>
                                                );
                                            })()}
                                            
                                            {/* Role Badge - Top Right */}
                                            {member.role === 'admin' && (
                                                <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center shadow-lg border border-red-400">
                                                    <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                                                    </svg>
                                                </div>
                                            )}
                                            
                                            {member.role === 'manager' && (
                                                <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg border border-blue-400">
                                                    <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                                    </svg>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}

                                {/* Show More Indicator */}
                                {workspaceMembers.length > 6 && (
                                    <div className="flex justify-center">
                                        <div className="w-10 h-10 bg-gradient-to-br from-b-darklight to-b-semidark border-2 border-dashed border-bor hover:border-bor-grn rounded-xl flex items-center justify-center transition-all duration-200 cursor-pointer hover:scale-105"
                                            title={`${workspaceMembers.length - 6} more members`}>
                                            <span className="text-sm font-bold text-t-light hover:text-t-grn transition-colors">
                                                +{workspaceMembers.length - 6}
                                            </span>
                                        </div>
                                    </div>
                                )}

                                {/* No Workspace State */}
                                {workspaceMembers.length === 0 && (
                                    <div className="text-center space-y-3">
                                        <div className="flex justify-center">
                                            <div className="w-10 h-10 bg-gradient-to-br from-b-darklight to-b-semidark border-2 border-dashed border-bor rounded-xl flex items-center justify-center">
                                                <Users className="w-5 h-5 text-t-mut" />
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-xs font-medium text-t-mut leading-tight">
                                                No Member
                                            </p>
                                            <p className="text-xs text-t-mut/70 leading-tight mt-0.5">
                                                Selected
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>

                        </div>
                    </div>

                    {/* Logout Button - Bottom */}
                    <div className="absolute bottom-0 py-4 bg-b-semidark left-0 right-0">
                        <div className="flex justify-center">
                            <button
                                onClick={async () => {
                                    try {
                                        const response = await fetch('/auth/logout', {
                                            method: 'POST',
                                            headers: {
                                                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
                                                'Accept': 'application/json',
                                            },
                                        });
                                        
                                        if (response.ok) {
                                            window.location.href = '/login';
                                        }
                                    } catch (error) {
                                        console.error('Logout error:', error);
                                        addToast("Logout failed", "error");
                                    }
                                }}
                                className="p-3 rounded-lg transition-colors group"
                                title="Logout"
                            >
                                <svg className="w-8 h-8 text-t-mut group-hover:text-t-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                {tooltipData.visible && (
                    <div 
                        className="fixed bg-b-dark text-t-light px-2 py-1 rounded text-xs whitespace-nowrap z-[9999] pointer-events-none"
                        style={{
                            left: `${tooltipData.x}px`,
                            top: `${tooltipData.y}px`,
                            transform: 'translateY(-50%)'
                        }}
                    >
                        {tooltipData.text}
                        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-2 h-2 bg-b-dark rotate-45"></div>
                    </div>
                )}

                {/* Main Content */}
                <div className={`flex-1 flex flex-col min-w-0 pl-8 ${activeView === "tasks" ? "lg:ml-[140px] border-l-0 pl-2.5" : "lg:ml-[455px]" } lg:my-6 lg:mr-[450px] border-l border-bor transition-all duration-300`}>
                    {/* Header */}
                    <div className="bg-b-dark pb-8 pt-11 fixed top-0 left-[170px] right-6 z-50 border-b border-bor">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                            <div className="flex flex-col lg:flex-row lg:items-center lg:space-x-6">
                                <div>
                                    <h1 className="text-xl lg:text-2xl font-bold text-t-light flex items-center space-x-2">
                                        <span>
                                            {activeView === "dashboard" && "Dashboard"}
                                            {activeView === "calendar" && "Content Calendar"}
                                            {activeView === "tasks" && (
                                                <div className="flex flex-col">
                                                    <span>Task Manager</span>
                                                    <div className="flex items-center justify-between">
                                                        <h3 className="text-base font-medium text-t-mut flex items-center gap-2">
                                                            {(() => {
                                                                if (selectedCategory === 'all') {
                                                                    return (
                                                                        <>
                                                                            <Hash className="w-5 h-5 text-t-light" />
                                                                            <span>All Tasks</span>
                                                                        </>
                                                                    );
                                                                }
                                                                
                                                                const categoryConfig = TASK_CATEGORIES[selectedCategory.toUpperCase()];
                                                                const Icon = categoryConfig?.icon || Hash;
                                                                const categoryName = selectedCategory === 'content' ? 'Content Planning' :
                                                                                selectedCategory === 'project' ? 'Project Management' :
                                                                                selectedCategory === 'sales' ? 'Sales Pipeline' : 'Task Area';
                                                                
                                                                return (
                                                                    <>
                                                                        <Icon className="w-4 h-4 text-t-mut" />
                                                                        <span>{categoryName}</span>
                                                                    </>
                                                                );
                                                            })()}
                                                        </h3>
                                                    </div>
                                                </div>
                                            )}
                                        </span>
                                    </h1>
                                </div>

                                {/* Search */}
                                <div className="relative group flex-1 lg:flex-none">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-t-light w-5 h-5" />
                                        <Input
                                            ref={searchRef}
                                            placeholder="Search content, tags, or assignees... (⌘K)"
                                            value={searchQuery}
                                            onChange={(e) =>
                                                setSearchQuery(e.target.value)
                                            }
                                            leftIcon={Search}
                                            className="lg:w-96  placeholder-t-mut/70"
                                            containerClassName="w-full lg:w-auto"
                                        />
                                        {searchQuery && (
                                            <button
                                                onClick={() =>
                                                    setSearchQuery("")
                                                }
                                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-t-light hover:text-t-light"
                                            >
                                                <X className="w-6 h-6 text-t-red" />
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center space-x-3">
                                    {/* <div>
                                        <h3 className="text-t-light font-bold text-base leading-none">
                                            {currentWorkspace ? currentWorkspace.name : 'No Workspace Selected'}
                                        </h3>
                                        <p className="text-xs text-t-mut">
                                            {currentWorkspace ? `${workspaceMembers.length} members` : 'Create or select a workspace'}
                                        </p>
                                    </div> */}
                                    {/* Workspace Selector */}
                                    <div className="flex-shrink-0 min-w-[200px]">
                                        {workspaces.length > 0 ? (
                                            <Dropdown
                                                options={workspaces.map(workspace => ({
                                                    value: workspace.id,
                                                    label: workspace.name,
                                                    icon: Users,
                                                    description: `${workspace.members?.length || 0} members`
                                                }))}
                                                value={currentWorkspace?.id}
                                                onChange={async (workspaceId) => {
                                                    const workspace = workspaces.find(t => t.id === workspaceId);
                                                    if (workspace) {
                                                        setCurrentWorkspace(workspace);
                                                        try {
                                                            const members = await workspaceApi.getWorkspaceMembers(workspace.id);
                                                            setWorkspaceMembers(members);
                                                        } catch (error) {
                                                            addToast('Failed to load workspace members', 'error');
                                                        }
                                                    }
                                                }}
                                                placeholder="Select workspace..."
                                                enableHover={false}
                                            />
                                        ) : (
                                            <button
                                                onClick={() => setIsWorkspaceModalOpen(true)}
                                                className="px-4 py-2 bg-b-grn hover:bg-b-grn-hov text-t-light rounded-xl transition-colors font-medium flex items-center space-x-2"
                                            >
                                                <Plus className="w-4 h-4" />
                                                <span>Create Workspace</span>
                                            </button>
                                        )}
                                    </div>
                                    <div className="ml-auto">
                                        <button
                                            onClick={() => {
                                                setPanelContent('profile');
                                                setIsCreatePanelOpen(true);
                                            }}
                                            className="group px-3 py-2.5 transition-colors"
                                        >
                                                <SlidersHorizontal className={`w-6 h-6  group-hover:text-t-yel ${
                                        panelContent === 'profile' ? "text-t-yel" : "text-t-mut"} animate-slide-up`} />
                                        </button>
                                    </div>
                                </div>

                            </div>

                            <div className="flex items-center justify-between lg:justify-end space-x-3">
                                <button
                                    onClick={() => {
                                        if (panelContent !== 'create') {
                                            setIsEditMode(false);        
                                            setEditingTask(null);
                                            setViewingTask(null);
                                            setIsViewMode(false);        
                                            setPanelContent('create');
                                            setIsCreatePanelOpen(true);
                                        }
                                    }}
                                    disabled={panelContent !== 'recent-activity'}
                                    className={`group px-7 py-2 text-xl rounded-2xl transition-all duration-200 font-medium transform hover:-translate-y-0.5 active:scale-95 flex ${
                                        panelContent !== 'recent-activity'
                                            ? 'items-baseline text-t-mut cursor-not-allowed  hover:-translate-y-0' 
                                            : 'items-center bg-b-acc hover:bg-b-acc-hov text-t-mut'
                                    }`}
                                >
                                    {panelContent === 'view' ? (
                                        <>
                                            <span className="hidden sm:inline">Viewing</span>
                                            <div className="ml-1 flex space-x-1">
                                                <div className="w-1 h-1 bg-current rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                                <div className="w-1 h-1 bg-current rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                                <div className="w-1 h-1 bg-current rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                            </div>
                                        </>
                                    ) : panelContent === 'edit' ? (
                                        <>
                                            <span className="hidden sm:inline">Editing</span>
                                            <div className="ml-1 flex space-x-1">
                                                <div className="w-1 h-1 bg-current rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                                <div className="w-1 h-1 bg-current rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                                <div className="w-1 h-1 bg-current rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                            </div>
                                        </>
                                    ) : panelContent === 'create' ? (
                                        <>
                                            <span className="hidden sm:inline">Creating</span>
                                            <div className="ml-1 flex space-x-1">
                                                <div className="w-1 h-1 bg-current rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                                <div className="w-1 h-1 bg-current rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                                <div className="w-1 h-1 bg-current rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                            </div>
                                        </>
                                    ) : panelContent === 'profile' ? (
                                        <>
                                            <span className="hidden sm:inline">Lab</span>
                                            <div className="ml-1 flex space-x-1">
                                                <div className="w-1 h-1 bg-current rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                                <div className="w-1 h-1 bg-current rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                                <div className="w-1 h-1 bg-current rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <Plus strokeWidth={2} className="text-xl mr-2 transition-all text-t-acc duration-300 ease-in-out group-hover:rotate-180" />
                                            <span className="hidden sm:inline text-xl font-medium text-t-acc">Task</span>
                                        </>
                                    )}
                                </button>

                                {/* <button
                                onClick={() => setIsCreatePanelOpen(true)}
                                className="group px-6 py-3 text-lg bg-b-acc hover:bg-b-acc/70 text-t-light rounded-2xl transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:scale-95 flex items-center"
                                >
                                <Plus className="w-6 h-6 mr-2 transition-transform duration-500 ease-in-out group-hover:rotate-[180deg]" />
                                <span className="hidden sm:inline">Project Baru</span>
                                </button> */}


                                <div className="relative" ref={notificationRef}>
                                    <button
                                        onClick={() => setShowNotifications(!showNotifications)}
                                        className="relative p-3 hover:bg-b-acc rounded-xl transition-colors ml-3"
                                    >
                                        <Bell className="w-7 h-7 text-t-mut" />
                                        {unreadCount > 0 && (
                                            <div className="absolute top-1 right-1 w-5 h-5 bg-b-red rounded-full flex items-center justify-center">
                                                <span className="text-xs text-white font-medium">
                                                    {unreadCount > 9 ? '9+' : unreadCount}
                                                </span>
                                            </div>
                                        )}
                                    </button>
                                    
                                    {showNotifications && (
                                        <div className="absolute right-0 top-full mt-2 w-80 bg-b-semidark rounded-xl shadow-lg border border-borlight z-50 max-h-96 overflow-hidden">
                                            <div className="p-4 border-b border-bor">
                                                <div className="flex items-center justify-between">
                                                    <h3 className="font-semibold text-t-light">Notifications</h3>
                                                    {unreadCount > 0 && (
                                                        <button 
                                                            onClick={async () => {
                                                                try {
                                                                    await api.markAllAsRead();
                                                                    setUnreadCount(0);
                                                                    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
                                                                } catch (error) {
                                                                    console.error('Failed to mark all as read:', error);
                                                                }
                                                            }}
                                                            className="text-xs text-t-grn hover:text-green-400"
                                                        >
                                                            Mark all read
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                            
                                            <div className="max-h-80 overflow-y-auto">
                                                {notifications.length > 0 ? (
                                                    <div className="space-y-1">
                                                        {notifications.map((notification) => (
                                                            <div
                                                                key={notification.id}
                                                                className={`p-4 hover:bg-b-darklight transition-colors cursor-pointer ${
                                                                    !notification.is_read ? 'bg-b-darklight/50' : ''
                                                                }`}
                                                                onClick={async () => {
                                                                    // Mark as read first
                                                                    if (!notification.is_read) {
                                                                        try {
                                                                            await api.markNotificationAsRead(notification.id);
                                                                            setNotifications(prev => 
                                                                                prev.map(n => 
                                                                                    n.id === notification.id 
                                                                                        ? { ...n, is_read: true }
                                                                                        : n
                                                                                )
                                                                            );
                                                                            setUnreadCount(prev => Math.max(0, prev - 1));
                                                                        } catch (error) {
                                                                            console.error('Failed to mark as read:', error);
                                                                        }
                                                                    }

                                                                    // Navigate to task if notification has task_id
                                                                    if (notification.task_id) {
                                                                        try {
                                                                            // Fetch task data
                                                                            const response = await fetch(`/api/tasks/${notification.task_id}`, {
                                                                                headers: {
                                                                                    'Accept': 'application/json',
                                                                                    'X-CSRF-TOKEN': api.getCsrfToken(),
                                                                                },
                                                                            });

                                                                            if (response.ok) {
                                                                                const task = await response.json();
                                                                                
                                                                                // Open task detail view
                                                                                setViewingTask(task);
                                                                                setIsViewMode(true);
                                                                                setIsEditMode(false);
                                                                                setEditingTask(null);
                                                                                setIsCreatePanelOpen(true);
                                                                                setPanelContent('view');
                                                                                
                                                                                // Close notification dropdown
                                                                                setShowNotifications(false);
                                                                                
                                                                                // Switch to tasks view if not already there
                                                                                setActiveView('tasks');
                                                                            } else {
                                                                                addToast('Task not found or deleted', 'error');
                                                                            }
                                                                        } catch (error) {
                                                                            console.error('Failed to open task:', error);
                                                                            addToast('Failed to open task', 'error');
                                                                        }
                                                                    }
                                                                }}
                                                            >
                                                                <div className="flex items-start space-x-3">
                                                                    {!notification.is_read && (
                                                                        <div className="w-2 h-2 bg-b-red rounded-full mt-2 flex-shrink-0" />
                                                                    )}
                                                                    <div className="flex-1 min-w-0">
                                                                        <p className="text-sm font-medium text-t-light">
                                                                            {notification.title}
                                                                        </p>
                                                                        <p className="text-xs text-t-mut mt-1">
                                                                            {notification.message}
                                                                        </p>
                                                                        <div className="flex items-center justify-between mt-1">
                                                                            <p className="text-xs text-t-mut">
                                                                                {notification.formatted_time}
                                                                            </p>
                                                                            {notification.task_id && (
                                                                                <span className="text-xs text-t-grn flex items-center space-x-1">
                                                                                    <Eye className="w-3 h-3" />
                                                                                    <span>Click to view</span>
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div className="text-center py-8">
                                                        <Bell className="w-8 h-8 text-t-mut mx-auto mb-2" />
                                                        <p className="text-sm text-t-mut">No notifications yet</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <button
                                    onClick={() => setIsShortcutsModalOpen(true)}
                                    className="p-3 rounded-xl transition-all hidden lg:block"
                                    title="Keyboard shortcuts"
                                >
                                    <Keyboard className="w-7 h-7 text-t-mut" />
                                </button>

                                {/* User Profile Button */}
                                <button
                                    onClick={() => {
                                        setPanelContent('profile');
                                        setIsCreatePanelOpen(true);
                                        setIsEditMode(false);
                                        setIsViewMode(false);
                                        setEditingTask(null);
                                        setViewingTask(null);
                                    }}
                                    className={`p-3 relative flex items-center rounded-full transition-all duration-200 ${
                                        panelContent === 'profile' ? '' : ''
                                    }`}
                                    title="Workspace Management"
                                >
                                    <div className={`rounded-full transition-all duration-200 ${
                                        panelContent === 'profile' 
                                            ? "filter-none" 
                                            : "filter grayscale hover:grayscale-0 opacity-65"
                                    }`}>
                                        <img
                                            src={window.Laravel?.user?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(window.Laravel?.user?.name || 'User')}&background=374151&color=fff`}
                                            alt={window.Laravel?.user?.name || 'User'}
                                            className="w-12 h-12 rounded-full object-cover"
                                        />
                                    </div>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 flex lg:gap-8 p-4 lg:p-0 lg:pt-36 h-[calc(100vh-140px)] overflow-hidden hide-scrollbar">
                        {/* Recent Projects - Fixed */}
                        {activeView !== "tasks" && (
                        <div className="hidden xl:block xl:fixed xl:left-[180px] xl:top-40 xl:bottom-6 xl:w-60 xl:z-20">
                            <div className="rounded-xl h-full flex flex-col overflow-hidden space-y-5">
                                {/* Header */}
                                <div>
                                    <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-semibold text-t-mut/70">
                                        Recent
                                    </h3>
                                    {/* Footer Actions */}
                                    <button
                                        onClick={() => {
                                            setActiveView("tasks");
                                            setSelectedCategory("all");
                                            setSelectedStatus("active");
                                            setSelectedChannel("all");
                                            setSelectedPriority("all");
                                            setSearchQuery("");
                                        }}
                                        className="px-3 py-2 text-base text-t-acc rounded-xl transition-colors font-medium flex items-center justify-center"
                                    >
                                        <Eye className="w-5 h-5 mr-2" />
                                        View All
                                    </button>
                                    </div>
                                    <p className="text-t-light text-5xl leading-[1.2] mb-2">
                                    <span className="block">Ongoing</span>
                                    <span className="block font-bold">
                                        {contents.filter(task => isOngoingTask(task)).length}{" "}
                                        Tasks
                                    </span>
                                    </p>
                                </div>

                                {/* Projects List */}
                                <div className="flex-1 overflow-y-auto hide-scrollbar custom-scrollbar space-y-5">
                                    {contents
                                        .filter((task) => isOngoingTask(task))
                                        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
                                        .map((task) => {
                                            const category = TASK_CATEGORIES[task.category.toUpperCase()];
                                            const Icon = category?.icon || FileText;

                                            // Check overdue/due today
                                            const now = new Date();
                                            const taskDate = new Date(task.dueDate);
                                            const isOverdue = taskDate < now && !['published', 'done', 'completed', 'selesai', 'closed'].includes(task.status);
                                            const isDueToday = taskDate.toDateString() === now.toDateString();

                                            return (
                                                <div
                                                    key={task.id}
                                                    className="group p-5 bg-b-semidark rounded-2xl hover:bg-b-acc/30 transition-all duration-200 cursor-pointer border border-transparent hover:border-bor"
                                                    onClick={(e) => {
                                                        if (e.target.closest('button')) return;
                                                        triggerTaskDetail(task);
                                                    }}
                                                >
                                                    {/* Overdue/Due Today Indicator */}
                                                    {(isOverdue || isDueToday) && (
                                                        <div className="flex items-center justify-between mb-3">
                                                            <div></div>
                                                            {isOverdue && (
                                                                <span className="text-xs font-medium text-t-red flex items-center space-x-1 bg-red-500/10 px-2 py-1 rounded-full">
                                                                    <AlertTriangle className="w-3 h-3" />
                                                                    <span>Overdue</span>
                                                                </span>
                                                            )}
                                                            {isDueToday && !isOverdue && (
                                                                <span className="text-xs font-medium text-orange-400 flex items-center space-x-1 bg-orange-500/10 px-2 py-1 rounded-full">
                                                                    <Zap className="w-3 h-3" />
                                                                    <span>Due Today</span>
                                                                </span>
                                                            )}
                                                        </div>
                                                    )}

                                                    {/* Title */}
                                                    <h3 className="text-t-light font-semibold text-lg mb-3 leading-snug group-hover:text-t-grn transition-colors line-clamp-2">
                                                        {task.title}
                                                    </h3>

                                                    {/* Bottom Info */}
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center space-x-1">
                                                            <Avatar 
                                                                name={task.assignee.name} 
                                                                size="sm" 
                                                                src={(() => {
                                                                    // Find workspace member by assignee email
                                                                    const member = workspaceMembers.find(m => m.id === task.assignee.id);
                                                                    return member?.avatar || null;
                                                                })()} 
                                                            />
                                                            <span className="text-t-mut text-sm font-medium">{task.assignee.name.split(' ')[0]}</span>
                                                        </div>

                                                        {task.priority && (() => {
                                                            const priorityDisplay = getPriorityDisplay(task.priority);
                                                            return (
                                                                <span className={`px-2 py-1 rounded-md text-xs font-medium ${priorityDisplay.bgClass}`}>
                                                                    {priorityDisplay.label}
                                                                </span>
                                                            );
                                                        })()}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                </div>
                            </div>
                        </div>
                        )}

                        {/* Main Content - Kanan */}
                        <div className="flex-1 min-w-0 overflow-y-auto hide-scrollbar">
                            <Suspense
                                fallback={
                                    <div className="flex items-center justify-center py-12">
                                        <LoadingSpinner size="lg" />
                                    </div>
                                }
                            >
                                {/* Dashboard View */}
                                <div style={{ display: activeView === "dashboard" ? "block" : "none" }}>
                                    <div className="space-y-8">
                                        {/* Stats Overview */}
                                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                                            {[
                                                {
                                                    label: "Total Tasks",
                                                    value: contentStats.total,
                                                    change: "+12%",
                                                    icon: FileText,
                                                    iconColor: "bg-b-grn",
                                                },
                                                {
                                                    label: "In Progress",
                                                    value: contentStats.inProgress,
                                                    change: "+8%",
                                                    icon: Clock,
                                                    iconColor: "bg-b-darklight",
                                                },
                                                {
                                                    label: "Today",
                                                    value: contentStats.dueToday,
                                                    change: contentStats.dueToday > 0 ? "🔥 Need Action" : " All clear",
                                                    icon: CalendarIcon,
                                                    iconColor: contentStats.dueToday > 0 ? "bg-orange-500" : "bg-b-grn",
                                                },
                                                {
                                                    label: "Overdue",
                                                    value: contentStats.overdue,
                                                    change: contentStats.overdue > 0 ? "⚠️ Urgent" : " On track",
                                                    icon: AlertTriangle,
                                                    iconColor: contentStats.overdue > 0 ? "bg-b-red" : "bg-b-grn",
                                                },
                                            ].map((stat, index) => (
                                                <div
                                                    key={index}
                                                    className={`rounded-2xl ${stat.label === "Total Tasks" ? "bg-b-unique-a" : stat.label === "Overdue" ? "bg-b-unique-b" : "bg-b-semidark "} p-4 lg:p-6 relative overflow-hidden`}
                                                    >
                                                    <div className="flex items-center relative gap-3">
                                                        <p className="text-xs lg:text-sm font-medium text-t-mut">
                                                            {stat.label}
                                                        </p>
                                                        <span className="text-xs lg:text-sm font-medium text-t-grn">
                                                            {stat.change}
                                                        </span>
                                                    </div>
                                                        <p className="text-5xl font-bold text-t-light">
                                                            {stat.value}
                                                        </p>
                                                        <stat.icon size={20} strokeWidth={1} className={`absolute -bottom-4 -right-6 w-24 h-24 ${stat.label === "Overdue" ? "text-b-dark" : "text-b-dark"} `} />
                                                    <div className="flex items-center justify-between">
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Calendar Component */}
                                        <div>
                                            {React.useMemo(() => (
                                                <CalendarComponent
                                                    selectedDate={selectedDate}
                                                    setSelectedDate={setSelectedDate}
                                                    onTaskClick={triggerTaskDetail}
                                                    recentActivityRef={recentActivityRef}
                                                    calendarFilter={calendarFilter}          
                                                    setCalendarFilter={setCalendarFilter}      
                                                    contentTargetFilter={contentTargetFilter} 
                                                    setContentTargetFilter={setContentTargetFilter} 
                                                    contents={contents} 
                                                />
                                            ), [selectedDate, triggerTaskDetail, currentDate, contents, isCalendarCollapsed, calendarFilter, contentTargetFilter])}
                                        </div>
                                        
                                    </div>
                                </div>

                                {/* Task Manager View */}
                                <div style={{ display: activeView === "tasks" ? "block" : "none" }}>
                                    <div className="space-y-6">
                                        {/* Dynamic Filters */}
                                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                                            <div className="flex items-center space-x-4">
                                                {/* Status Filter */}
                                                <Dropdown
                                                    options={getStatusOptions(selectedCategory)}
                                                    value={selectedStatus}
                                                    onChange={setSelectedStatus}
                                                    placeholder="All Status"
                                                    size="sm"
                                                />

                                                {/* Channel Filter - only for content */}
                                                {selectedCategory === 'content' && (
                                                    <Dropdown
                                                        options={[
                                                            { value: 'all', label: 'All Platforms', icon: Hash },
                                                            ...channels.slice(1).map((channel) => ({
                                                                value: channel.id,
                                                                label: channel.name,
                                                                icon: channel.icon
                                                            }))
                                                        ]}
                                                        value={selectedChannel}
                                                        onChange={setSelectedChannel}
                                                        placeholder="All Platforms"
                                                        size="sm"
                                                    />
                                                )}

                                                {/* Priority Filter */}
                                                <Dropdown
                                                    options={[
                                                        { value: "all", label: "All Priorities", icon: Circle },
                                                        ...getPriorityOptions(true).map(option => ({
                                                            ...option,
                                                            label: `${option.label} Priority` // Add "Priority" suffix for filter
                                                        }))
                                                    ]}
                                                    value={selectedPriority}
                                                    onChange={setSelectedPriority}
                                                    placeholder="All Priorities"
                                                    size="sm"
                                                />

                                                {/* Sort Dropdown */}
                                                <Dropdown
                                                    options={[
                                                        { value: "dueDate", label: "Due Date", icon: Clock },
                                                        { value: "updatedAt", label: "Last Updated", icon: RefreshCw },
                                                        { value: "createdAt", label: "Created Date", icon: Calendar },
                                                        { value: "title", label: "Task Name", icon: FileText },
                                                        { value: "priority", label: "Priority", icon: AlertTriangle },
                                                        { value: "status", label: "Status", icon: Circle },
                                                        { value: "assignee", label: "Assignee", icon: User },
                                                        { value: "category", label: "Category", icon: Tag },
                                                    ]}
                                                    value={sortBy}
                                                    onChange={setSortBy}
                                                    placeholder="Sort by..."
                                                    size="sm"
                                                />
                                                
                                                <button
                                                    onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                                                    className="p-2 border border-borlight rounded-lg hover:bg-b-darklight transition-colors flex items-center space-x-1"
                                                    title={`Sort ${sortOrder === "asc" ? "Z-A (Descending)" : "A-Z (Ascending)"}`}
                                                >
                                                    {sortOrder === "asc" ? (
                                                        <>
                                                            <SortAsc className="w-4 h-4 text-t-light" />
                                                            <span className="text-xs text-t-mut hidden sm:inline">A-Z</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <SortDesc className="w-4 h-4 text-t-light" />
                                                            <span className="text-xs text-t-mut hidden sm:inline">Z-A</span>
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                            
                                            <div className="text-sm text-t-light">
                                                {filteredContents.length} tasks
                                            </div>
                                        </div>

                                        {/* Task Grid */}
                                        <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-6 items-start">
                                            {filteredContents.map((task) => (
                                                <EnhancedTaskCard 
                                                    key={task.id} 
                                                    task={task} 
                                                    setContents={setContents}
                                                    addToast={addToast}
                                                    triggerTaskDetail={triggerTaskDetail}
                                                    setEditingTask={setEditingTask}
                                                    setIsEditMode={setIsEditMode}
                                                    setIsCreatePanelOpen={setIsCreatePanelOpen}
                                                    setViewingTask={setViewingTask}
                                                    setIsViewMode={setIsViewMode}
                                                    setIsDeleteModalOpen={setIsDeleteModalOpen}
                                                    setTaskToDelete={setTaskToDelete}
                                                    workspaceMembers={workspaceMembers}
                                                    setPanelContent={setPanelContent}
                                                    clients={clients}
                                                />
                                            ))}
                                        </div>

                                        {filteredContents.length === 0 && (
                                            <div className="col-span-full text-center py-16">
                                                <div className="w-16 h-16 mx-auto mb-6 bg-b-semidark rounded-2xl flex items-center justify-center">
                                                    <List className="w-8 h-8 text-t-mut" />
                                                </div>
                                                <h3 className="text-xl font-semibold text-t-light mb-2">
                                                    No tasks found
                                                </h3>
                                                <p className="text-t-mut mb-6 max-w-md mx-auto">
                                                    {debouncedSearchQuery
                                                        ? `No results for "${debouncedSearchQuery}"`
                                                        : "Try adjusting your filters or create a new task"}
                                                </p>
                                                <button
                                                    onClick={() => {
                                                        setIsViewMode(false);
                                                        setIsEditMode(false);
                                                        setEditingTask(null);
                                                        setViewingTask(null);
                                                        setIsCreatePanelOpen(true);
                                                    }}
                                                    className="px-6 py-3 bg-b-grn hover:bg-green-600 text-t-light rounded-xl transition-colors font-medium flex items-center mx-auto space-x-2"
                                                >
                                                    <Plus className="w-4 h-4" />
                                                    <span>Create Task</span>
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>

                            </Suspense>
                        </div>
                    </div>
                </div>

                {/* Modals */}
                <ShortcutsModal />

                {/* Toast Notifications */}
                <ToastContainer toasts={toasts} removeToast={removeToast} />

                {/* Right Panel - Always Visible */}
                <div className="fixed top-6 right-6 bottom-6 w-[400px] z-40 hidden lg:block" 
                    style={{ marginTop: '144px' }}>
                    <div className="h-full bg-b-semidark rounded-3xl flex flex-col animate-slide-in-right overflow-hidden" 
                        data-panel="true">
                        {/* Panel Header - Only show for specific panels */}
                        {panelContent !== 'recent-activity' && (
                            <div className="flex items-center justify-between p-6 border-b border-bor bg-b-semidark">
                                <h2 className="text-xl font-semibold text-t-light flex items-center space-x-2">
                                    {panelContent === 'view' ? (
                                        <>
                                            <Eye className="w-5 h-5 text-t-blue" />
                                            <span>Task Details</span>
                                        </>
                                    ) : panelContent === 'edit' ? (
                                        <>
                                            <Edit3 className="w-5 h-5 text-t-blue" />
                                            <span>Edit Task</span>
                                        </>
                                    ) : panelContent === 'create' ? (
                                        <>
                                            <Plus className="w-5 h-5 text-t-grn" />
                                            <span>New Task</span>
                                        </>
                                    ) : panelContent === 'profile' ? (
                                        <>
                                            <SlidersHorizontal className="w-5 h-5 text-t-yel" />
                                            <span>Prawd Lab</span>
                                        </>
                                    ) : null}
                                </h2>
                                <button
                                    onClick={() => {
                                        setPanelContent('recent-activity');
                                        setIsEditMode(false);
                                        setIsViewMode(false);
                                        setEditingTask(null);
                                        setViewingTask(null);
                                    }}
                                    className="p-2 hover:bg-b-semidark rounded-lg transition-colors"
                                    title="Back to Dashboard (Esc)"
                                >
                                    <X className="w-5 h-5 text-t-light" />
                                </button>
                            </div>
                        )}

                        {/* Panel Content */}
                        <div className={`flex-1 overflow-y-auto custom-scrollbar ${panelContent === 'recent-activity' ? "p-6" : (isEditMode || isViewMode) ? "px-6 pb-6 pt-2" : "px-6 pb-6 pt-6"}`}>
                            {panelContent === 'view' ? (
                                <DetailTaskView
                                    task={viewingTask}
                                    onEdit={() => {
                                        setEditingTask(viewingTask);
                                        setIsEditMode(true);
                                        setIsViewMode(false);
                                        setViewingTask(null);
                                        setPanelContent('edit');
                                    }}
                                    onClose={() => setPanelContent('recent-activity')}
                                    onDelete={async (taskId) => {
                                        try {
                                            await api.deleteTask(taskId);
                                            setContents(prev => prev.filter(t => t.id !== taskId));
                                            addToast('Task deleted successfully', 'success');
                                            setPanelContent('recent-activity');
                                        } catch (error) {
                                            addToast(error.message || 'Failed to delete task', 'error');
                                        }
                                    }}
                                    onNotificationUpdate={refreshNotifications}
                                />
                            ) : panelContent === 'edit' || panelContent === 'create' ? (
                                <CreateContentForm 
                                    onSubmit={handleCreateContent}
                                    onCancel={() => setPanelContent('recent-activity')}
                                    editingTask={editingTask}
                                    isEditMode={isEditMode}
                                    workspaceMembers={workspaceMembers}
                                    currentWorkspace={currentWorkspace}
                                    clients={clients}
                                    onNavigateToClient={() => {
                                        setActiveProfileCard('client');
                                        setClientFormMode('list');
                                        setPanelContent('profile');
                                    }}
                                />
                            ) : panelContent === 'profile' ? (
                                <div className="space-y-6">

                                    {/* Cards Section */}
                                    <div className="grid grid-cols-2 gap-4">
                                        {/* Workspace Card */}
                                        <div className={`bg-b-closedark rounded-xl p-4 cursor-pointer hover:bg-b-darklight transition-colors ${
                                            activeProfileCard === 'workspace' ? 'ring-2 ring-b-acc' : ''
                                        }`} 
                                            onClick={() => setActiveProfileCard('workspace')}>
                                            <div className="flex items-center space-x-3">
                                                <div className="w-8 h-8 bg-b-acc rounded-lg flex items-center justify-center">
                                                    <Users className="w-4 h-4 text-t-acc" />
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-t-light text-base">Workspace</h3>
                                                    <p className="text-xs text-t-mut">{workspaceMembers.length} members</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Client Card */}
                                        <div className={`bg-b-closedark rounded-xl p-4 cursor-pointer hover:bg-b-darklight transition-colors ${
                                            activeProfileCard === 'client' ? 'ring-2 ring-b-blue' : ''
                                        }`}
                                            onClick={() => setActiveProfileCard('client')}>
                                            <div className="flex items-center space-x-3">
                                                <div className="w-8 h-8 bg-b-blue/20 rounded-lg flex items-center justify-center">
                                                    <Briefcase className="w-4 h-4 text-t-blue" />
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-t-light text-base">Client</h3>
                                                    <p className="text-xs text-t-mut">{clients.length} clients</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Conditional Content Based on Active Card */}
                                    {activeProfileCard === 'client' ? (
                                        /* Client Management Section */
                                        <div className="space-y-4">
                                            {clientFormMode === 'list' ? (
                                                /* List Mode */
                                                <>
                                                    {loadingClients ? (
                                                        <div className="flex items-center justify-center py-8">
                                                            <LoadingSpinner size="md" />
                                                            <span className="ml-3 text-t-light">Loading clients...</span>
                                                        </div>
                                                    ) : clients.length === 0 ? (
                                                        /* No Clients State */
                                                        <div className="text-center py-16 bg-b-darklight rounded-xl">
                                                            <div className="w-16 h-16 mx-auto mb-6 bg-b-blue/10 rounded-2xl flex items-center justify-center">
                                                                <Briefcase className="w-8 h-8 text-t-blue" />
                                                            </div>
                                                            <h4 className="text-xl font-semibold text-t-light mb-2">No Clients Yet</h4>
                                                            <p className="text-t-mut mb-6 max-w-sm mx-auto">
                                                                Start by adding your first client to manage projects and track progress.
                                                            </p>
                                                            <button
                                                                onClick={() => setClientFormMode('add')}
                                                                className="px-6 py-3 bg-b-blue hover:bg-blue-600 text-t-light rounded-xl transition-colors font-medium flex items-center mx-auto space-x-2"
                                                            >
                                                                <Plus className="w-4 h-4" />
                                                                <span>Add First Client</span>
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        /* Clients List */
                                                        <div className="space-y-4">
                                                            <div className="flex justify-between items-center">
                                                                <button
                                                                    onClick={() => setClientFormMode('add')}
                                                                    className="w-full px-4 py-3 bg-b-blue hover:bg-b-blue-hov text-base text-t-mut rounded-2xl transition-colors font-medium flex items-center space-x-2"
                                                                >
                                                                    <Plus className="w-6 h-6" />
                                                                    <span>Add New Client</span>
                                                                </button>
                                                            </div>
                                                                    
                                                            <div className="space-y-6">
                                                                {/* Clients */}
                                                                {renderClientSection(
                                                                    clients.filter(client => client.clientStage === 'client'),
                                                                    'Clients', 
                                                                    CheckCircle2,
                                                                    'text-t-grn'
                                                                )}
                                                                {/* Prospects */}
                                                                {renderClientSection(
                                                                    clients.filter(client => client.clientStage === 'prospect'),
                                                                    'Prospects',
                                                                    Target,
                                                                    'text-t-blue'
                                                                )}
                                                                
                                                            </div>
                                                        </div>
                                                    )}
                                                </>
                                            ) : (
                                                /* Form Mode */
                                                <>
                                                    <div className="flex items-center justify-between">
                                                        <h3 className="text-lg font-semibold text-t-light flex items-center space-x-2">
                                                            <Briefcase className="w-5 h-5 text-t-blue" />
                                                            <span>{clientFormMode === 'edit' ? 'Edit Client' : 'Add New Client'}</span>
                                                        </h3>
                                                        <button
                                                            onClick={() => {
                                                                setClientFormMode('list');
                                                                setEditingClient(null);
                                                            }}
                                                            className="text-xs text-t-mut hover:text-t-light transition-colors flex items-center space-x-1"
                                                        >
                                                            <ArrowLeft className="w-3 h-3" />
                                                            <span>Back to List</span>
                                                        </button>
                                                    </div>

                                                    <ClientForm 
                                                        onSubmit={async (clientData) => {
                                                            try {
                                                                if (clientFormMode === 'edit') {
                                                                    const updatedClient = await clientApi.updateClient(editingClient.id, clientData);
                                                                    setClients(prev => prev.map(c => c.id === editingClient.id ? updatedClient : c));
                                                                    addToast('Client updated successfully!', 'success');
                                                                } else {
                                                                    const newClient = await clientApi.createClient(clientData);
                                                                    setClients(prev => [...prev, newClient]);
                                                                    addToast('Client added successfully!', 'success');
                                                                }
                                                                setClientFormMode('list');
                                                                setEditingClient(null);
                                                            } catch (error) {
                                                                addToast(error.message, 'error');
                                                            }
                                                        }}
                                                        onCancel={() => {
                                                            setClientFormMode('list');
                                                            setEditingClient(null);
                                                        }}
                                                        editingClient={editingClient}
                                                        currentWorkspace={currentWorkspace}
                                                    />
                                                </>
                                            )}
                                        </div>
                                    ) : (
                                        /* Workspace Management Section (Default) */
                                        <div className="space-y-4">
                                            {/* Workspace Selector Section */}
                                            <div className="space-y-3">
                                                {workspaces.length > 0 ? (
                                                    <div className="flex items-center gap-1.5">
                                                        <Dropdown
                                                            className="flex-1"
                                                            options={workspaces.map(workspace => ({
                                                                value: workspace.id,
                                                                label: workspace.name,
                                                                icon: Users,
                                                                description: `${workspace.members?.length || 0} members`
                                                            }))}
                                                            value={currentWorkspace?.id}
                                                            onChange={async (workspaceId) => {
                                                                const workspace = workspaces.find(t => t.id === workspaceId);
                                                                if (workspace) {
                                                                    setCurrentWorkspace(workspace);
                                                                    try {
                                                                        const members = await workspaceApi.getWorkspaceMembers(workspace.id);
                                                                        setWorkspaceMembers(members);
                                                                    } catch (error) {
                                                                        addToast('Failed to load workspace members', 'error');
                                                                    }
                                                                }
                                                            }}
                                                            placeholder="Select workspace..."
                                                            enableHover={false}
                                                        />
                                                        <div className="flex items-center gap-1.5">
                                                            <button
                                                                onClick={() => setIsWorkspaceModalOpen(true)}
                                                                className="px-4 py-3 bg-b-acc hover:bg-b-acc-hov text-t-mut rounded-2xl transition-colors font-medium flex items-center justify-center space-x-2"
                                                            >
                                                                <Plus className="w-6 h-6" />
                                                            </button>
                                                            <button
                                                                onClick={() => setIsInviteModalOpen(true)}
                                                                className="px-4 py-3 bg-b-acc hover:bg-b-acc-hov text-t-mut rounded-2xl transition-colors font-medium flex items-center justify-center space-x-2"
                                                            >
                                                                <UserPlus className="w-6 h-6" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="text-center py-8 bg-b-darklight rounded-xl">
                                                        <Users className="w-8 h-8 text-t-mut mx-auto mb-3" />
                                                        <p className="text-sm text-t-light mb-4">No workspaces available</p>
                                                        <button
                                                            onClick={() => setIsWorkspaceModalOpen(true)}
                                                            className="px-4 py-2 bg-b-grn hover:bg-b-grn-hov text-t-light rounded-lg transition-colors font-medium flex items-center mx-auto space-x-2"
                                                        >
                                                            <Plus className="w-4 h-4" />
                                                            <span>Create First Workspace</span>
                                                        </button>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Loading State */}
                                            {loadingWorkspaces && (
                                                <div className="flex items-center justify-center py-8">
                                                    <LoadingSpinner size="md" />
                                                    <span className="ml-3 text-t-light">Loading workspaces...</span>
                                                </div>
                                            )}

                                            {/* Workspace Management Section */}
                                            {!loadingWorkspaces && currentWorkspace && (
                                                <div className="space-y-4">
                                                    {/* Workspace Info Header */}
                                                    <div className="bg-b-closedark rounded-2xl p-4">                                                        
                                                        <div className="space-y-2">
                                                            <div className="flex items-center justify-between">
                                                                <span className="text-sm text-t-mut">Total Members</span>
                                                                <span className="text-sm font-medium text-t-light">{workspaceMembers.length}</span>
                                                            </div>
                                                            <div className="flex items-center justify-between">
                                                                <span className="text-sm text-t-mut">Internal</span>
                                                                <span className="text-sm font-medium text-t-grn">
                                                                    {workspaceMembers.filter(m => m.member_type === 'internal' || !m.member_type).length}
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center justify-between">
                                                                <span className="text-sm text-t-mut">External</span>
                                                                <span className="text-sm font-medium text-t-blue">
                                                                    {workspaceMembers.filter(m => m.member_type === 'external').length}
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center justify-between">
                                                                <span className="text-sm text-t-mut">Owner</span>
                                                                <span className="text-sm font-medium text-t-light">{currentWorkspace.owner?.name}</span>
                                                            </div>
                                                            <div className="flex items-center justify-between">
                                                                <span className="text-sm text-t-mut">Created</span>
                                                                <span className="text-sm font-medium text-t-light">
                                                                    {new Date(currentWorkspace.created_at).toLocaleDateString()}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="space-y-4">
                                                        {/* Internal Members Section */}
                                                        {(() => {
                                                            const internalMembers = workspaceMembers.filter(member => member.member_type === 'internal' || !member.member_type);
                                                            
                                                            return internalMembers.length > 0 && (
                                                                <div>
                                                                    <h4 className="px-2 text-sm font-semibold text-t-grn flex items-center space-x-2 mb-3">
                                                                        <Users className="w-4 h-4" />
                                                                        <span>Internal Team ({internalMembers.length})</span>
                                                                    </h4>
                                                                    <div className="space-y-2">
                                                                        {internalMembers.map((member) => (
                                                                            <div key={member.id} className="flex items-center justify-between p-3 bg-b-closedark rounded-2xl hover:bg-b-darklight transition-colors">
                                                                                <div className="flex items-center space-x-3 min-w-0 flex-1">
                                                                                    <Avatar name={member.name} size="sm" src={member.avatar} />
                                                                                    <div className="min-w-0 flex-1">
                                                                                        <p className="font-medium text-t-light truncate">{member.name}</p>
                                                                                        <p className="text-xs text-t-mut truncate">{member.id}</p>
                                                                                    </div>
                                                                                </div>
                                                                                
                                                                                <div className="flex items-center space-x-2 flex-shrink-0">
                                                                                    <span className={`px-2 py-1 rounded-md text-xs font-medium ${
                                                                                        member.role === 'admin' ? 'bg-red-500/20 text-t-red-badge' :
                                                                                        member.role === 'manager' ? 'bg-blue-500/20 text-blue-400' :
                                                                                        'bg-gray-500/20 text-gray-400'
                                                                                    }`}>
                                                                                        {member.role}
                                                                                    </span>
                                                                                    
                                                                                    {member.role !== 'admin' && (
                                                                                        <button
                                                                                            onClick={async (e) => {
                                                                                                e.stopPropagation();
                                                                                                if (confirm('Remove this member from the workspace?')) {
                                                                                                    try {
                                                                                                        await workspaceApi.removeMember(currentWorkspace.id, member.id);
                                                                                                        const updatedMembers = workspaceMembers.filter(m => m.id !== member.id);
                                                                                                        setWorkspaceMembers(updatedMembers);
                                                                                                        addToast('Member removed successfully', 'success');
                                                                                                    } catch (error) {
                                                                                                        addToast(error.message, 'error');
                                                                                                    }
                                                                                                }
                                                                                            }}
                                                                                            className="p-1.5 text-t-red hover:text-t-red transition-colors"
                                                                                            title="Remove member"
                                                                                        >
                                                                                            <Trash2 className="w-4 h-4" />
                                                                                        </button>
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            );
                                                        })()}

                                                        {/* External Members Section */}
                                                        {(() => {
                                                            const externalMembers = workspaceMembers.filter(member => member.member_type === 'external');
                                                            
                                                            return externalMembers.length > 0 && (
                                                                <div>
                                                                    <h4 className="text-sm font-semibold text-t-blue flex items-center space-x-2 mb-3">
                                                                        <UserPlus className="w-4 h-4" />
                                                                        <span>External Contributors ({externalMembers.length})</span>
                                                                    </h4>
                                                                    <div className="space-y-2">
                                                                        {externalMembers.map((member) => (
                                                                            <div key={member.id} className="flex items-center justify-between p-3 bg-b-darklight/50 rounded-2xl hover:bg-b-darklight transition-colors border border-b-blue/20">
                                                                                <div className="flex items-center space-x-3 min-w-0 flex-1">
                                                                                    <div className="relative">
                                                                                        <Avatar name={member.name} size="sm" src={member.avatar} />
                                                                                        {/* External indicator */}
                                                                                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-b-blue border border-b-darklight rounded-full flex items-center justify-center">
                                                                                            <UserPlus className="w-2 h-2 text-white" />
                                                                                        </div>
                                                                                    </div>
                                                                                    <div className="min-w-0 flex-1">
                                                                                        <p className="font-medium text-t-light truncate">{member.name}</p>
                                                                                        <div className="flex items-center space-x-2">
                                                                                            <p className="text-xs text-t-mut truncate">{member.id}</p>
                                                                                            {member.external_category && (
                                                                                                <>
                                                                                                    <span className="text-xs text-t-mut">•</span>
                                                                                                    <span className="text-xs text-t-blue font-medium">
                                                                                                        {member.external_category === 'freelance' ? 'Freelance' :
                                                                                                        member.external_category === 'outsourced' ? 'Outsourced' : 'Vendor'}
                                                                                                    </span>
                                                                                                </>
                                                                                            )}
                                                                                        </div>
                                                                                        {member.notes && (
                                                                                            <p className="text-xs text-t-mut/70 truncate mt-0.5">{member.notes}</p>
                                                                                        )}
                                                                                    </div>
                                                                                </div>
                                                                                
                                                                                <div className="flex items-center space-x-2 flex-shrink-0">
                                                                                    <span className={`px-2 py-1 rounded-md text-xs font-medium border ${
                                                                                        member.role === 'admin' ? 'bg-red-500/20 text-t-red-badge border-red-500/30' :
                                                                                        member.role === 'manager' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                                                                                        'bg-gray-500/20 text-gray-400 border-gray-500/30'
                                                                                    }`}>
                                                                                        {member.role}
                                                                                    </span>
                                                                                    
                                                                                    {member.role !== 'admin' && (
                                                                                        <button
                                                                                            onClick={async (e) => {
                                                                                                e.stopPropagation();
                                                                                                if (confirm('Remove this external member from the workspace?')) {
                                                                                                    try {
                                                                                                        await workspaceApi.removeMember(currentWorkspace.id, member.id);
                                                                                                        const updatedMembers = workspaceMembers.filter(m => m.id !== member.id);
                                                                                                        setWorkspaceMembers(updatedMembers);
                                                                                                        addToast('External member removed successfully', 'success');
                                                                                                    } catch (error) {
                                                                                                        addToast(error.message, 'error');
                                                                                                    }
                                                                                                }
                                                                                            }}
                                                                                            className="p-1.5 text-t-red hover:text-t-red transition-colors"
                                                                                            title="Remove external member"
                                                                                        >
                                                                                            <Trash2 className="w-4 h-4" />
                                                                                        </button>
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            );
                                                        })()}

                                                        {/* No Members State */}
                                                        {workspaceMembers.length === 0 && (
                                                            <div className="text-center py-8 bg-b-darklight rounded-lg">
                                                                <Users className="w-6 h-6 text-t-mut mx-auto mb-2" />
                                                                <p className="text-sm text-t-light">No workspace members yet</p>
                                                                <p className="text-xs text-t-mut">Invite members to start collaborating</p>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Workspace Description */}
                                                    {currentWorkspace.description && (
                                                        <div>
                                                            <label className="block text-sm font-medium text-t-mut mb-2">Description</label>
                                                            <div className="p-3 bg-b-darklight rounded-lg">
                                                                <p className="text-sm text-t-light">{currentWorkspace.description}</p>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {/* No Workspace Selected State */}
                                            {!loadingWorkspaces && !currentWorkspace && workspaces.length > 0 && (
                                                <div className="text-center py-12">
                                                    <div className="w-12 h-12 mx-auto mb-4 bg-b-darklight rounded-xl flex items-center justify-center">
                                                        <Users className="w-6 h-6 text-t-mut" />
                                                    </div>
                                                    <h4 className="text-lg font-semibold text-t-light mb-2">
                                                        Select a Workspace
                                                    </h4>
                                                    <p className="text-sm text-t-mut mb-4">
                                                        Choose a workspace from the dropdown above to manage members and settings
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {/* Analytics Section - Debug Check */}
                                    <div>
                                        {/* Simple Analytics Header */}
                                        <div className="mb-4">
                                            <div className="flex items-center space-x-2 mb-4">
                                                <h3 className="text-lg font-semibold text-t-light">Analytics</h3>
                                                <span className="text-xs px-2 py-1 bg-b-closedark text-t-red-inb rounded-full font-medium">
                                                    Task Flow
                                                </span>
                                            </div>
                                        </div>
                                                                                
                                       <div className={`${isAnalyticsStackExpanded ? 'space-y-3' : 'relative h-16'} transition-all duration-300`}>                                           
                                            {(() => {
                                                // Calculate all data first
                                                const getCurrentDateRange = () => {
                                                    if (analyticsTimeframe === 'custom') {
                                                        return customDateRange;
                                                    }
                                                    
                                                    const end = new Date();
                                                    const start = new Date();
                                                    const days = parseInt(analyticsTimeframe.replace('d', ''));
                                                    start.setDate(start.getDate() - days);
                                                    
                                                    return {
                                                        start: start.toISOString().split('T')[0],
                                                        end: end.toISOString().split('T')[0]
                                                    };
                                                };

                                                const currentRange = getCurrentDateRange();
                                                const capacity = calculateCapacityIntelligence(allTasks, workspaceMembers, currentRange);
                                                const risk = calculateRiskAssessment(allTasks, workspaceMembers, currentRange);
                                                const statusDist = calculateStatusDistribution(allTasks, currentRange);
                                                const productivity = calculateProductivityTrend(allTasks, currentRange);

                                                // Comparative Analytics (if enabled)
                                                let comparativeData = null;
                                                if (showComparative && currentRange.start && currentRange.end) {
                                                    const startDate = new Date(currentRange.start);
                                                    const endDate = new Date(currentRange.end);
                                                    const daysDiff = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
                                                    
                                                    // Calculate previous period
                                                    const prevEnd = new Date(startDate);
                                                    prevEnd.setDate(prevEnd.getDate() - 1);
                                                    const prevStart = new Date(prevEnd);
                                                    prevStart.setDate(prevStart.getDate() - daysDiff);
                                                    
                                                    const prevRange = {
                                                        start: prevStart.toISOString().split('T')[0],
                                                        end: prevEnd.toISOString().split('T')[0]
                                                    };
                                                    
                                                    comparativeData = {
                                                        prev: {
                                                            capacity: calculateCapacityIntelligence(allTasks, workspaceMembers, prevRange),
                                                            risk: calculateRiskAssessment(allTasks, workspaceMembers, prevRange),
                                                            productivity: calculateProductivityTrend(allTasks, prevRange)
                                                        },
                                                        current: { capacity, risk, productivity }
                                                    };
                                                }

                                                // Helper function untuk comparative indicators
                                                const getChangeIndicator = (current, previous, isHigherBetter = true) => {
                                                    if (!previous) return null;
                                                    
                                                    const change = current - previous;
                                                    const percentage = Math.round((change / previous) * 100);
                                                    
                                                    if (change === 0) return { text: 'No change', color: 'text-t-mut', icon: '→' };
                                                    
                                                    const isPositive = isHigherBetter ? change > 0 : change < 0;
                                                    
                                                    return {
                                                        text: `${change > 0 ? '+' : ''}${percentage}%`,
                                                        color: isPositive ? 'text-t-grn' : 'text-t-red',
                                                        icon: change > 0 ? '↗' : '↘'
                                                    };
                                                };
                                                                                                            
                                                return (
                                                    <>
                                                        {/* Capacity Card */}
                                                        <div className={`${isAnalyticsStackExpanded ? 'relative z-10' : 'absolute top-0 left-0 right-0 rounded-2xl opacity-95 z-40'} cursor-pointer transition-all duration-300 ${
                                                            !isAnalyticsStackExpanded ? 'shadow-md' : ''
                                                        }`}>
                                                            <div className="bg-b-closedark rounded-2xl overflow-hidden">
                                                                <div 
                                                                    className="p-4 transition-colors cursor-pointer hover:bg-b-darklight"
                                                                    onClick={(e) => {
                                                                        if (!isAnalyticsStackExpanded) {
                                                                            // Stack collapsed - expand stack
                                                                            setIsAnalyticsStackExpanded(true);
                                                                        } else {
                                                                            // Stack expanded - toggle accordion
                                                                            setExpandedAnalytic(expandedAnalytic === 'capacity' ? null : 'capacity');
                                                                        }
                                                                    }}
                                                                >
                                                                    <div className="flex items-center justify-between mb-2">
                                                                        <div className="flex items-center space-x-2">
                                                                            <Users className="w-4 h-4 text-t-blue" />
                                                                            <span className="text-xs font-medium text-t-mut">TEAM CAPACITY</span>
                                                                        </div>
                                                                        <div className="flex items-center space-x-2">
                                                                            {isAnalyticsStackExpanded && (
                                                                                <MiniLineChart 
                                                                                    data={capacity.chartData} 
                                                                                    color="text-t-blue" 
                                                                                    height={20} 
                                                                                    width={50}
                                                                                />
                                                                            )}
                                                                            <ChevronDown className={`w-4 h-4 text-t-mut transition-transform ${
                                                                                expandedAnalytic === 'capacity' ? 'rotate-180' : ''
                                                                            } ${isAnalyticsStackExpanded ? '' : 'opacity-0'}`} />
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex items-center justify-between">
                                                                        <div>
                                                                            <div className="flex items-center space-x-2">
                                                                                <div className="text-2xl font-semibold text-t-light">{capacity.overallCapacity}%</div>
                                                                                {comparativeData && (() => {
                                                                                    const indicator = getChangeIndicator(
                                                                                        capacity.overallCapacity, 
                                                                                        comparativeData.prev.capacity.overallCapacity, 
                                                                                        true
                                                                                    );
                                                                                    return indicator ? (
                                                                                        <span className={`text-xs ${indicator.color} flex items-center`}>
                                                                                            <span className="mr-1">{indicator.icon}</span>
                                                                                            {indicator.text}
                                                                                        </span>
                                                                                    ) : null;
                                                                                })()}
                                                                            </div>
                                                                            <div className="text-sm text-t-mut">Workspace Capacity</div>
                                                                        </div>
                                                                        <div className="text-right">
                                                                            <div className="text-lg text-t-light">{capacity.efficiencyScore}</div>
                                                                            <div className="text-sm text-t-mut">Efficiency</div>
                                                                            {/* Executive Info */}
                                                                            {isAnalyticsStackExpanded && (
                                                                                <div className="mt-2 text-xs text-t-grn font-medium">
                                                                                    {(() => {
                                                                                        const executive = calculateExecutiveSummary(allTasks, workspaceMembers);
                                                                                        return `${executive.keyMetrics.workspaceHealth} Health • ${executive.keyMetrics.deliveryConfidence}% Confidence`;
                                                                                    })()}
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                
                                                                {/* Expanded Content */}
                                                                <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
                                                                    expandedAnalytic === 'capacity' ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0'
                                                                }`}>
                                                                    <div className="px-4 pb-3 border-t border-bor">
                                                                        <div className="pt-3 space-y-3">
                                                                            <div>
                                                                                <h4 className="text-xs font-semibold text-t-light mb-2 uppercase tracking-wide">Workspace Load</h4>
                                                                                <div className="space-y-1.5">
                                                                                    {capacity.memberDetails?.slice(0, 4).map((member) => {
                                                                                        const utilizationPercent = Math.round((member.currentLoad / member.maxCapacity) * 100);
                                                                                        return (
                                                                                            <div key={member.name} className="flex items-center space-x-3">
                                                                                                <div className="w-16 text-xs text-t-light font-medium truncate">{member.name}</div>
                                                                                                <div className="flex-1 bg-b-semidark rounded-full h-1">
                                                                                                    <div 
                                                                                                        className={`h-1 rounded-full transition-all duration-500 ${
                                                                                                            utilizationPercent > 90 ? 'bg-red-500/60' :
                                                                                                            utilizationPercent > 70 ? 'bg-yellow-400' : 'bg-t-grn'
                                                                                                        }`}
                                                                                                        style={{ width: `${Math.min(utilizationPercent, 100)}%` }}
                                                                                                    ></div>
                                                                                                </div>
                                                                                                <div className="text-xs text-t-mut w-8 text-right">{utilizationPercent}%</div>
                                                                                            </div>
                                                                                        );
                                                                                    })}
                                                                                </div>
                                                                            </div>
                                                                            
                                                                            {capacity.suggestedRebalancing?.length > 0 && (
                                                                                <div className="bg-orange-500/5 rounded-lg p-2">
                                                                                    <div className="text-xs text-orange-400 font-medium mb-1">
                                                                                        {capacity.suggestedRebalancing.length} optimization opportunities
                                                                                    </div>
                                                                                    <div className="text-xs text-t-mut">
                                                                                        Click for detailed rebalancing suggestions
                                                                                    </div>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Risk Card */}
                                                        <div className={`${isAnalyticsStackExpanded ? 'relative z-10' : 'absolute top-2 left-1 right-1 rounded-2xl opacity-70 z-30'} cursor-pointer transition-all duration-300 ${
                                                            !isAnalyticsStackExpanded ? 'shadow-sm' : ''
                                                        }`}>
                                                            <div className="bg-b-closedark rounded-2xl overflow-hidden">
                                                                <div 
                                                                    className="p-4 transition-colors cursor-pointer hover:bg-b-darklight"
                                                                    onClick={(e) => {
                                                                        if (!isAnalyticsStackExpanded) {
                                                                            // Stack collapsed - expand stack
                                                                            setIsAnalyticsStackExpanded(true);
                                                                        } else {
                                                                            // Stack expanded - toggle accordion
                                                                            setExpandedAnalytic(expandedAnalytic === 'risk' ? null : 'risk');
                                                                        }
                                                                    }}
                                                                >
                                                                    <div className="flex items-center justify-between mb-2">
                                                                        <div className="flex items-center space-x-2">
                                                                            <AlertTriangle className="w-4 h-4 text-t-red" />
                                                                            <span className="text-xs font-medium text-t-mut">PROJECT RISK</span>
                                                                        </div>
                                                                        <div className="flex items-center space-x-2">
                                                                            {isAnalyticsStackExpanded && (
                                                                                <MiniLineChart 
                                                                                    data={risk.chartData} 
                                                                                    color="text-t-red" 
                                                                                    height={20} 
                                                                                    width={50}
                                                                                />
                                                                            )}
                                                                            <ChevronDown className={`w-4 h-4 text-t-mut transition-transform ${
                                                                                expandedAnalytic === 'risk' ? 'rotate-180' : ''
                                                                            } ${isAnalyticsStackExpanded ? '' : 'opacity-0'}`} />
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex items-center justify-between">
                                                                        <div>
                                                                            <div className="flex items-center space-x-2">
                                                                                <div className="text-2xl font-semibold text-t-light">{risk.projectHealthScore}</div>
                                                                                {comparativeData && (() => {
                                                                                    const indicator = getChangeIndicator(
                                                                                        risk.projectHealthScore, 
                                                                                        comparativeData.prev.risk.projectHealthScore, 
                                                                                        true
                                                                                    );
                                                                                    return indicator ? (
                                                                                        <span className={`text-xs ${indicator.color} flex items-center`}>
                                                                                            <span className="mr-1">{indicator.icon}</span>
                                                                                            {indicator.text}
                                                                                        </span>
                                                                                    ) : null;
                                                                                })()}
                                                                            </div>
                                                                            <div className="text-sm text-t-mut">Health Score</div>
                                                                        </div>
                                                                        <div className="text-right">
                                                                            <div className="text-lg text-t-light">{risk.deliveryProbability}%</div>
                                                                            <div className="text-sm text-t-mut">Confidence</div>
                                                                            {/* Executive Alerts */}
                                                                            {(() => {
                                                                                {isAnalyticsStackExpanded && (() => {
                                                                                    const executive = calculateExecutiveSummary(allTasks, workspaceMembers);
                                                                                    return executive.alerts.length > 0 && (
                                                                                        <div className="mt-2 text-xs text-t-red font-medium">
                                                                                            ⚠️ {executive.alerts.length} Alert{executive.alerts.length > 1 ? 's' : ''}
                                                                                        </div>
                                                                                    );
                                                                                })()}
                                                                            })()}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                
                                                                {/* Expanded Content */}
                                                                <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
                                                                    expandedAnalytic === 'risk' ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0'
                                                                }`}>
                                                                    <div className="px-4 pb-3 border-t border-bor">
                                                                        <div className="pt-3">
                                                                            {risk.riskFactors?.length > 0 ? (
                                                                                <div>
                                                                                    <h4 className="text-xs font-semibold text-t-light mb-2 uppercase tracking-wide">Active Risks</h4>
                                                                                    <div className="space-y-1.5">
                                                                                        {risk.riskFactors.slice(0, 3).map((riskItem, index) => (
                                                                                            <div key={index} className="flex items-center justify-between py-1.5 px-2 bg-b-semidark rounded-lg">
                                                                                                <span className="text-xs text-t-light flex-1">{riskItem.message}</span>
                                                                                                <span className={`text-xs px-1.5 py-0.5 rounded text-center w-12 ${
                                                                                                    riskItem.severity === 'high' ? 'bg-red-500/20 text-t-red-badge' :
                                                                                                    riskItem.severity === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                                                                                                    'bg-blue-500/20 text-blue-400'
                                                                                                }`}>
                                                                                                    {riskItem.severity.slice(0, 1).toUpperCase()}
                                                                                                </span>
                                                                                            </div>
                                                                                        ))}
                                                                                    </div>
                                                                                    {risk.riskFactors.length > 3 && (
                                                                                        <div className="text-xs text-t-mut mt-1 text-center">
                                                                                            +{risk.riskFactors.length - 3} more risks
                                                                                        </div>
                                                                                    )}
                                                                                </div>
                                                                            ) : (
                                                                                <div className="bg-green-500/5 rounded-lg p-3 text-center">
                                                                                    <div className="text-xs text-green-400 font-medium">✓ No significant risks</div>
                                                                                    <div className="text-xs text-t-mut mt-0.5">Project health is good</div>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Status Card */}
                                                        <div className={`${isAnalyticsStackExpanded ? 'relative z-10' : 'absolute top-4 left-2 right-2 rounded-2xl opacity-45 z-20'} cursor-pointer transition-all duration-300 ${
                                                            !isAnalyticsStackExpanded ? 'shadow-sm' : ''
                                                        }`}>
                                                            <div className="bg-b-closedark rounded-2xl overflow-hidden">
                                                                <div 
                                                                    className="p-4 transition-colors cursor-pointer hover:bg-b-darklight"
                                                                    onClick={(e) => {
                                                                        if (!isAnalyticsStackExpanded) {
                                                                            // Stack collapsed - expand stack
                                                                            setIsAnalyticsStackExpanded(true);
                                                                        } else {
                                                                            // Stack expanded - toggle accordion
                                                                            setExpandedAnalytic(expandedAnalytic === 'status' ? null : 'status');
                                                                        }
                                                                    }}
                                                                >
                                                                    <div className="flex items-center justify-between mb-2">
                                                                        <div className="flex items-center space-x-2">
                                                                            <PieChart className="w-4 h-4 text-t-grn" />
                                                                            <span className="text-xs font-medium text-t-mut">STATUS DISTRIBUTION</span>
                                                                        </div>
                                                                        <ChevronDown className={`w-4 h-4 text-t-mut transition-transform ${
                                                                            expandedAnalytic === 'status' ? 'rotate-180' : ''
                                                                        } ${isAnalyticsStackExpanded ? '' : 'opacity-0'}`} />
                                                                    </div>
                                                                    <div className="flex items-center justify-between">
                                                                        <div>
                                                                            <div className="text-2xl font-semibold text-t-light">
                                                                                {statusDist.hasData ? `${statusDist.completed}%` : '--'}
                                                                            </div>
                                                                            <div className="text-sm text-t-mut">Completed</div>
                                                                        </div>
                                                                        <div className="text-right">
                                                                            <div className="text-lg text-t-light">
                                                                                {statusDist.hasData ? `${statusDist.inProgress}%` : '--'}
                                                                            </div>
                                                                            <div className="text-sm text-t-mut">Active</div>
                                                                            {/* Performance Rank */}
                                                                            {isAnalyticsStackExpanded && (
                                                                                <div className="mt-2 text-xs text-t-blue font-medium">
                                                                                    {statusDist.hasData ? (() => {
                                                                                        const executive = calculateExecutiveSummary(allTasks, workspaceMembers);
                                                                                        return executive.keyMetrics.performanceRank;
                                                                                    })() : 'No data yet'}
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                
                                                                {/* Expanded Content */}
                                                                <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
                                                                    expandedAnalytic === 'status' ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0'
                                                                }`}>
                                                                    <div className="px-4 pb-3 border-t border-bor">
                                                                        <div className="pt-3">
                                                                            {statusDist.hasData ? (
                                                                                <>
                                                                                    <h4 className="text-xs font-semibold text-t-light mb-2 uppercase tracking-wide">By Category</h4>
                                                                                    <div className="grid grid-cols-1 gap-1.5">
                                                                                        {['content', 'project', 'sales'].map(category => {
                                                                                            const categoryTasks = contents.filter(task => task.category === category);
                                                                                            const categoryName = TASK_CATEGORIES[category.toUpperCase()]?.name || category;
                                                                                            
                                                                                            if (categoryTasks.length === 0) return null;
                                                                                            
                                                                                            const categoryCompleted = Math.round(
                                                                                                (categoryTasks.filter(task => ['published', 'done', 'completed'].includes(task.status)).length / categoryTasks.length) * 100
                                                                                            );
                                                                                            
                                                                                            return (
                                                                                                <div key={category} className="flex items-center space-x-3 py-1">
                                                                                                    <div className="w-16 text-xs text-t-light font-medium">{categoryName.split(' ')[0]}</div>
                                                                                                    <div className="flex-1 bg-b-semidark rounded-full h-1">
                                                                                                        <div 
                                                                                                            className="h-1 bg-t-grn rounded-full transition-all duration-500"
                                                                                                            style={{ width: `${categoryCompleted}%` }}
                                                                                                        ></div>
                                                                                                    </div>
                                                                                                    <div className="text-xs text-t-mut w-8 text-right">{categoryCompleted}%</div>
                                                                                                    <div className="text-xs text-t-mut w-6 text-right">{categoryTasks.length}</div>
                                                                                                </div>
                                                                                            );
                                                                                        })}
                                                                                    </div>
                                                                                </>
                                                                            ) : (
                                                                                <div className="bg-b-semidark rounded-lg p-3 text-center">
                                                                                    <div className="text-xs text-t-mut font-medium">📊 No tasks to analyze</div>
                                                                                    <div className="text-xs text-t-mut mt-0.5">Create some tasks to see distribution</div>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Productivity Card */}
                                                        <div className={`${isAnalyticsStackExpanded ? 'relative z-10' : 'absolute top-6 left-3 right-3 rounded-2xl opacity-20 z-10'} cursor-pointer transition-all duration-300 ${
                                                            !isAnalyticsStackExpanded ? '' : ''
                                                        }`}>
                                                            <div className="bg-b-closedark rounded-2xl overflow-hidden">
                                                                <div 
                                                                    className="p-4 transition-colors cursor-pointer hover:bg-b-darklight"
                                                                    onClick={(e) => {
                                                                        if (!isAnalyticsStackExpanded) {
                                                                            // Stack collapsed - expand stack
                                                                            setIsAnalyticsStackExpanded(true);
                                                                        } else {
                                                                            // Stack expanded - toggle accordion
                                                                            setExpandedAnalytic(expandedAnalytic === 'productivity' ? null : 'productivity');
                                                                        }
                                                                    }}
                                                                >
                                                                    <div className="flex items-center justify-between mb-2">
                                                                        <div className="flex items-center space-x-2">
                                                                            <TrendingUp className="w-4 h-4 text-t-purp" />
                                                                            <span className="text-xs font-medium text-t-mut">PRODUCTIVITY</span>
                                                                        </div>
                                                                        <div className="flex items-center space-x-2">
                                                                            {isAnalyticsStackExpanded && (
                                                                                <MiniLineChart 
                                                                                    data={productivity.chartData} 
                                                                                    color="text-t-purp" 
                                                                                    height={20} 
                                                                                    width={50}
                                                                                />
                                                                            )}
                                                                            <ChevronDown className={`w-4 h-4 text-t-mut transition-transform ${
                                                                                expandedAnalytic === 'productivity' ? 'rotate-180' : ''
                                                                            } ${isAnalyticsStackExpanded ? '' : 'opacity-0'}`} />
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex items-center justify-between">
                                                                        <div>
                                                                            <div className="flex items-center space-x-2">
                                                                                <div className="text-2xl font-semibold text-t-light">{productivity.thisWeek}</div>
                                                                                {comparativeData && (() => {
                                                                                    const indicator = getChangeIndicator(
                                                                                        productivity.thisWeek, 
                                                                                        comparativeData.prev.productivity.thisWeek, 
                                                                                        true
                                                                                    );
                                                                                    return indicator ? (
                                                                                        <span className={`text-xs ${indicator.color} flex items-center`}>
                                                                                            <span className="mr-1">{indicator.icon}</span>
                                                                                            {indicator.text}
                                                                                        </span>
                                                                                    ) : null;
                                                                                })()}
                                                                            </div>
                                                                            <div className="text-sm text-t-mut">This Week</div>
                                                                        </div>
                                                                        <div className="text-right">
                                                                            <div className="text-lg text-t-light">{productivity.avgDuration}d</div>
                                                                            <div className="text-sm text-t-mut">Avg Cycle</div>
                                                                            {/* Quarterly Forecast */}
                                                                            {isAnalyticsStackExpanded && (
                                                                                <div className="mt-2 text-xs text-t-purp font-medium">
                                                                                    {(() => {
                                                                                        const executive = calculateExecutiveSummary(allTasks, workspaceMembers);
                                                                                        return `Q4: ${executive.keyMetrics.quarterlyOutlook} tasks`;
                                                                                    })()}
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                
                                                                {/* Expanded Content */}
                                                                <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
                                                                    expandedAnalytic === 'productivity' ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0'
                                                                }`}>
                                                                    <div className="px-4 pb-3 border-t border-bor">
                                                                        <div className="pt-3 space-y-3">
                                                                            <div className="grid grid-cols-2 gap-3">
                                                                                <div className={`rounded-lg p-2 text-center ${
                                                                                    productivity.trend > 0 ? 'bg-green-500/10' :
                                                                                    productivity.trend < 0 ? 'bg-red-500/10' : 'bg-b-semidark'
                                                                                }`}>
                                                                                    <div className={`text-lg font-bold ${
                                                                                        productivity.trend > 0 ? 'text-green-400' :
                                                                                        productivity.trend < 0 ? 'text-t-red' : 'text-t-light'
                                                                                    }`}>
                                                                                        {productivity.trend > 0 ? `+${productivity.trend}` : productivity.trend || '0'}
                                                                                    </div>
                                                                                    <div className="text-xs text-t-mut">vs last week</div>
                                                                                </div>
                                                                                <div className="bg-b-darklight rounded-lg p-2 text-center">
                                                                                    <div className="text-lg font-bold text-t-light">{productivity.avgDuration}d</div>
                                                                                    <div className="text-xs text-t-mut">avg cycle</div>
                                                                                </div>
                                                                            </div>
                                                                            
                                                                            <div className="bg-b-semidark rounded-lg p-2">
                                                                                <div className="text-xs text-t-light">
                                                                                    <div className="flex flex-row-reverse items-center justify-between space-x-1">
                                                                                        {productivity.trend > 0 ? (
                                                                                            <>
                                                                                                <TrendingUp className="w-3 h-3 text-t-grn" />
                                                                                                <span>Velocity up {productivity.trend}. Good momentum!</span>
                                                                                            </>
                                                                                        ) : productivity.trend < 0 ? (
                                                                                            <>
                                                                                                <TrendingDown className="w-3 h-3 text-t-red" />
                                                                                                <span>Velocity down {Math.abs(productivity.trend)}. Review blockers.</span>
                                                                                            </>
                                                                                        ) : (
                                                                                            <>
                                                                                                <Minus className="w-3 h-3 text-t-mut" />
                                                                                                <span>Steady performance. {productivity.avgDuration}d cycle stable.</span>
                                                                                            </>
                                                                                        )}
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </>
                                                );
                                            })()}
                                        </div>
                                    </div>
                                    
                                    {/* Board Activity Section */}
                                    <div style={{ 
                                        marginTop: !isAnalyticsStackExpanded ? '90px' : '30px',
                                        transition: 'margin-top 300ms ease-in-out'
                                    }}>
                                        <div className="flex items-center space-x-2 mb-4">
                                            <Activity className="w-5 h-5 text-t-purp" />
                                            <h3 className="text-lg font-semibold text-t-light">Board Activity</h3>
                                        </div>
                                        <RecentActivity ref={recentActivityRef} currentWorkspace={currentWorkspace} workspaceMembers={workspaceMembers} />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

            </div>

        {/* Confirmation Modal */}
        <ConfirmationModal
            isOpen={isDeleteModalOpen}
            onClose={() => {
                setIsDeleteModalOpen(false);
                setTaskToDelete(null);
            }}
            onConfirm={() => taskToDelete && handleDeleteTask(taskToDelete)}
            title="Delete Task"
            message={`Are you sure you want to delete "${taskToDelete?.title}"? This action cannot be undone.`}
            confirmText="Delete"
            type="danger"
        />

        {/* Workspace Creation Modal */}
        <Modal
            isOpen={isWorkspaceModalOpen}
            onClose={() => setIsWorkspaceModalOpen(false)}
            title="Create New Workspace"
            size="sm"
        >
            <WorkspaceCreateForm 
                onSubmit={async (workspaceData) => {
                    try {
                        const newWorkspace = await workspaceApi.createWorkspace(workspaceData);
                        setWorkspaces(prev => [...prev, newWorkspace]);
                        setIsWorkspaceModalOpen(false);
                        addToast('Workspace created successfully!', 'success');
                    } catch (error) {
                        addToast(error.message, 'error');
                    }
                }}
                onCancel={() => setIsWorkspaceModalOpen(false)}
            />
        </Modal>

        {/* Invite Member Modal */}
        <Modal
            isOpen={isInviteModalOpen}
            onClose={() => {
                setIsInviteModalOpen(false);
                setShowInvitationLink(false);
                setInvitationResponse(null);
            }}
            title="Invite Workspace Member"
            size="sm"
        >
            {!showInvitationLink ? (
                <InviteMemberForm 
                    onSubmit={async (memberData) => {
                        try {
                            const response = await workspaceApi.inviteMember(currentWorkspace.id, memberData);
                            
                            if (response.email_sent) {
                                addToast(`Invitation email sent to ${response.invited_email}!`, 'success');
                                setIsInviteModalOpen(false);
                            } else {
                                // Email failed, show manual link
                                setInvitationResponse(response);
                                setShowInvitationLink(true);
                            }
                            
                            // Reload workspace members
                            const members = await workspaceApi.getWorkspaceMembers(currentWorkspace.id);
                            setWorkspaceMembers(members);
                            
                        } catch (error) {
                            addToast(error.message, 'error');
                        }
                    }}
                    onCancel={() => setIsInviteModalOpen(false)}
                />
            ) : (
                <InvitationLinkDisplay 
                    invitationData={invitationResponse}
                    onClose={() => {
                        setIsInviteModalOpen(false);
                        setShowInvitationLink(false);
                        setInvitationResponse(null);
                    }}
                />
            )}
        </Modal>

        </ErrorBoundary>
    );
};

const getPriorityColor = (priority) => {
    const config = PRIORITY_CONFIG[priority];
    if (!config) return "border-l-gray-300";
    
    const borderColors = {
        1: "border-l-green-500",    // low
        2: "border-l-yellow-500",   // medium  
        3: "border-l-red-500",      // high
        4: "border-l-red-600"       // urgent
    };
    
    return borderColors[config.order] || "border-l-gray-300";
};

const EnhancedTaskCard = ({ 
    task, 
    setContents, 
    addToast, 
    triggerTaskDetail,
    setEditingTask, 
    setIsEditMode, 
    setIsCreatePanelOpen,
    setViewingTask,
    setIsViewMode,
    setIsDeleteModalOpen,
    setTaskToDelete,
    workspaceMembers = [],
    setPanelContent,
    clients = []
}) => {
    const [isUpdating, setIsUpdating] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const category = TASK_CATEGORIES[task.category.toUpperCase()];
    const Icon = category?.icon || FileText;
    
    const getStatusLabel = () => {
        if (!task?.status) {
            return 'Status';
        }
        if (category?.statusLabels && category.statusLabels[task.status]) {
            return category.statusLabels[task.status];
        }
        return String(task.status).replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
    };

    const getDeadlineDate = () => {
        if (task.category === 'sales' && task.followUpDate) {
            return task.followUpDate;
        }
        return task.dueDate;
    };

    const deadlineDate = getDeadlineDate();

    const getContentTypeIcon = () => {
        if (task.category !== 'content' || !task.contentType) return null;
        
        const iconMap = {
            'post': Image,
            'video': Video, 
            'article': FileText,
            'email': Mail
        };
        
        return iconMap[task.contentType] || FileText;
    };

    const handleQuickUpdate = async (field, value) => {
        setIsUpdating(true);
        try {
            const updateData = { [field]: value };
            const updatedTask = await api.updateTask(task.id, updateData);
            
            // Update local state
            setContents(prev => prev.map(t => 
                t.id === task.id ? updatedTask : t
            ));
            
            addToast(`${field} updated successfully`, 'success');
        } catch (error) {
            addToast(`Failed to update ${field}`, 'error');
        } finally {
            setIsUpdating(false);
        }
    };

    const ContentTypeIcon = getContentTypeIcon();
    
    // Check if overdue or due today
    const now = new Date();
    const taskDate = new Date(deadlineDate);
    const isOverdue = taskDate < now && !['published', 'done', 'completed', 'selesai', 'closed'].includes(task.status);
    const isDueToday = taskDate.toDateString() === now.toDateString();

    return (
        <div
            className={`group relative bg-b-semidark rounded-2xl ${getPriorityColor(task.priority)} p-6 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer flex flex-col h-full ${
                isUpdating ? 'z-20' : 'hover:z-10'
            }`}
            onClick={() => {
                triggerTaskDetail(task);
            }}
        >
            {/* Top Section - Category & Actions */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-b-darklight rounded-lg flex items-center justify-center">
                        <Icon className="w-4 h-4 text-t-light" />
                    </div>
                    <span className="font-medium text-t-mut uppercase tracking-wide">
                        {category?.name?.split(' ')[0] || 'Task'}
                    </span>
                    {/* Client Info - Only for content with client target */}
                    {task.category === 'content' && task.contentTarget === 'client' && task.client_id && (
                        <div className="font-medium text-t-light truncate uppercase">
                            <span className="mr-2">•</span>
                            {(() => {
                                // Find client name from clients array using client_id
                                const client = (window.ContentPlannerClients || []).find(c => c.id === task.client_id);
                                return client ? client.name : 'Unknown Client';
                            })()}
                        </div>
                    )}

                </div>

                <div className="flex items-center gap-2">
                    {/* Overdue/Due Today Indicator */}
                    {isOverdue && (
                        <span className="text-xs font-medium text-t-red flex items-center space-x-1">
                            <AlertTriangle className="w-3 h-3" />
                            <span>Overdue</span>
                        </span>
                    )}
                    {isDueToday && !isOverdue && (
                        <span className="text-xs font-medium text-orange-400 flex items-center space-x-1">
                            <Zap className="w-3 h-3" />
                            <span>Due Today</span>
                        </span>
                    )}
                    
                    {/* Three Dots Menu - Only visible on hover */}
                    <div className="opacity-70 group-hover:opacity-100 transition-opacity">
                        <ThreeDotsMenu
                            options={[
                                {
                                    label: "Edit",
                                    icon: Edit3,
                                    onClick: () => {
                                        setEditingTask(task);
                                        setIsEditMode(true);
                                        setIsViewMode(false);
                                        setViewingTask(null);
                                        setIsCreatePanelOpen(true);
                                        setPanelContent('edit');
                                    }
                                },
                                {
                                    label: "Delete",
                                    icon: Trash2,
                                    danger: true,
                                    onClick: () => {
                                        setIsDeleteModalOpen(true);
                                        setTaskToDelete(task);
                                    }
                                }
                            ]}
                        />
                    </div>
                </div>
            </div>

            {/* Task Title */}
            <h3 className="font-semibold flex items-center gap-2 text-t-light text-lg mb-3 transition-colors ">
                {ContentTypeIcon && (
                    <div className="w-4 h-4 text-t-light flex-shrink-0">
                        <ContentTypeIcon className="w-4 h-4" />
                    </div>
                )}
                <span className="line-clamp-1">{task.title}</span>
            </h3>
            {/* Status & Priority Badges */}
            <div className="flex items-center space-x-2 mb-4">
                {/* First Dropdown - Status OR Deal Stage */}
                <div 
                    onClick={(e) => e.stopPropagation()}
                    className="inline-block"
                >
                    {task.category === 'sales' ? (
                        // DEAL STAGE untuk Sales
                        <Dropdown
                            enableHover={false}
                            options={[
                                { value: "lead", label: "Lead", icon: Target },
                                { value: "qualified", label: "Qualified", icon: CheckCircle2 },
                                { value: "proposal", label: "Proposal", icon: FileText },
                                { value: "negotiation", label: "Negosiasi", icon: MessageSquare },
                                { value: "closed", label: "Closed", icon: Star }
                            ]}
                            value={task.dealStage}
                            onChange={(value) => handleQuickUpdate('dealStage', value)}
                            className="min-w-0"
                            customTrigger={(isOpen) => {
                                if (isOpen !== dropdownOpen) {
                                    setDropdownOpen(isOpen);
                                }
                                
                                return (
                                    <button 
                                        className={`group/status px-2.5 py-1 rounded-full text-xs font-medium cursor-pointer transition-all duration-200 flex items-center space-x-1 ${
                                            !task.dealStage 
                                                ? 'bg-gray-500/20 text-gray-400 hover:bg-gray-500/30' 
                                                : 'bg-b-darklight text-t-light hover:bg-b-acc'
                                        }`}
                                    >
                                        <span>{task.dealStage || 'Deal Stage'}</span>
                                        <ChevronDown className={`w-3 h-3 opacity-75 group-hover/status:opacity-100 transition-opacity ${isOpen ? 'rotate-180 opacity-100' : ''}`} />
                                    </button>
                                );
                            }}
                        />
                    ) : (
                        // STATUS untuk Content & Project
                        <Dropdown
                            enableHover={false}
                            options={(() => {
                                const categoryConfig = TASK_CATEGORIES[task.category.toUpperCase()];
                                if (!categoryConfig) return [];
                                
                                return categoryConfig.workflow.map(status => ({
                                    value: status,
                                    label: categoryConfig.statusLabels[status],
                                    icon: getStatusIcon(status)
                                }));
                            })()}
                            value={task.status}
                            onChange={(value) => handleQuickUpdate('status', value)}
                            className="min-w-0"
                            customTrigger={(isOpen) => (
                                <button className={`group/status px-2.5 py-1 rounded-full text-xs font-medium cursor-pointer transition-all duration-200 flex items-center space-x-1 ${
                                    !task.status 
                                        ? 'bg-gray-500/20 text-gray-400 hover:bg-gray-500/30' 
                                        : 'bg-b-darklight text-t-light hover:bg-b-acc'
                                }`}>
                                    <span>{getStatusLabel()}</span>
                                    <ChevronDown className={`w-3 h-3 opacity-75 group-hover/status:opacity-100 transition-opacity ${isOpen ? 'rotate-180 opacity-100' : ''}`} />
                                </button>
                            )}
                        />
                    )}
                </div>
                
                {/* Priority Dropdown - sama untuk semua kategori */}
                <div 
                    onClick={(e) => e.stopPropagation()}
                    className="inline-block"
                >
                <Dropdown
                    enableHover={false}
                    options={getPriorityOptions(true)}
                    value={task.priority}
                    onChange={(value) => handleQuickUpdate('priority', value)}
                    className="min-w-0"
                    customTrigger={(isOpen) => {
                        const priorityConfig = task.priority ? PRIORITY_CONFIG[task.priority] : null;
                        const displayText = priorityConfig ? priorityConfig.label : 'Priority';
                        const buttonClass = priorityConfig ? priorityConfig.bgClass : 'bg-gray-500/20 text-gray-400 hover:bg-gray-500/30';
                        
                        return (
                            <button className={`group/priority px-2.5 py-1 rounded-full text-xs font-medium cursor-pointer transition-all duration-200 flex items-center space-x-1 ${buttonClass}`}>
                                <span>{displayText}</span>
                                <ChevronDown className={`w-3 h-3 opacity-75 group-hover/priority:opacity-100 transition-opacity ${isOpen ? 'rotate-180 opacity-100' : ''}`} />
                            </button>
                        );
                    }}
                />
                </div>
            </div>

            {/* Bottom Section - Assignee & Due Date */}
            <div className="flex items-center justify-between mt-auto">
                <div className="flex items-center space-x-1">
                    <Avatar 
                        name={task.assignee.name} 
                        size="sm" 
                        src={(() => {
                            // Find workspace member by assignee email
                            const member = workspaceMembers.find(m => m.id === task.assignee.id);
                            return member?.avatar || null;
                        })()} 
                    />
                    <span className="text-sm text-t-light font-medium">{task.assignee.name.split(' ')[0]}</span>
                </div>
                
                <div className="flex items-center space-x-1 text-sm text-t-mut">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{formatDate(deadlineDate)}</span>
                </div>
            </div>
        </div>
    );
};

// Initialize the app
const container = document.getElementById("app");
if (container) {
    const root = createRoot(container);
    root.render(<ContentPlanner />);
}

export default ContentPlanner;