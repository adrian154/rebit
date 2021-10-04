# rebit

A collection of Bitcoin utilities.

# Notes

* 64 bit integers are cast to Numbers (effectively 53-bit) when there are currently no plausible situations where they'd overflow.
    * e.g. timestamps