<?xml version="1.0"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:ms="urn:schemas-microsoft-com:xslt" exclude-result-prefixes="ms">

    <xsl:output method="xml" version="1.0" encoding="utf-8" omit-xml-declaration="no" indent="yes" cdata-section-elements="message stacktrace" />
    <xsl:strip-space elements="*"/>

    <xsl:template match="azunit">

        <html>
            <head>
                <name><xsl:value-of select="@name" /></name>
                <style>
                    body { font-family: sans-serif; }
                    ol { list-style-type: none; }
                    li.failed:before { content: "\2718"; margin:0 5px 0 -15px; color: #800; }
                    li.passed:before { content: "\2714"; margin:0 5px 0 -15px; color: #080; }
                    li.ignored:before { content: "\23F8"; margin:0 5px 0 -15px; color: #888; }
                    li.ignored { color: #444; }
                </style>
            </head>
            <body>
                <main>
                    <header class="{@result}">
                        <h1><xsl:value-of select="@name" /></h1>
                        <span><xsl:value-of select="@subscription" /></span>
                        <p>Completed in 
                            <time datetime="{concat('PT', @duration, 'S')}"><xsl:value-of select="@duration" /></time> seconds on 
                            <time datetime="{@start}"><xsl:value-of select="@start" /></time>.
                        </p>
                    </header>
                    
                        <xsl:apply-templates />
                        
                    
                </main>
            </body>
        </html>

    </xsl:template>

    <xsl:template match="group">
        <article>
            <header class="failed">
                <h2>Quickstart 101</h2>
                <p>Completed in 
                    <time datetime="{concat('PT', @duration, 'S')}"><xsl:value-of select="@duration" /></time> seconds on 
                            <time datetime="{@start}"><xsl:value-of select="@start" /></time>.
                </p>
            </header>
            <section>
                <xsl:apply-templates />
            </section>
        </article>
    </xsl:template>


    <xsl:template match="test">
        <div class="{@result}">
            <h3><xsl:value-of select="@name" /></h3>
            <p>Completed in 
                <time datetime="{concat('PT', @duration, 'S')}"><xsl:value-of select="@duration" /></time> seconds on 
                <time datetime="{@start}"><xsl:value-of select="@start" /></time>.
            </p>
            <ol>
                <xsl:apply-templates />
            </ol>
        </div>
    </xsl:template>

    <xsl:template match="assertion">
        <li class="{@result}"><xsl:value-of select="test()"/></li>
    </xsl:template>

</xsl:stylesheet>

