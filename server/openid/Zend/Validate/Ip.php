<?php
/**
 * Zend Framework
 *
 * LICENSE
 *
 * This source file is subject to the new BSD license that is bundled
 * with this package in the file LICENSE.txt.
 * It is also available through the world-wide-web at this URL:
 * http://framework.zend.com/license/new-bsd
 * If you did not receive a copy of the license and are unable to
 * obtain it through the world-wide-web, please send an email
 * to license@zend.com so we can send you a copy immediately.
 *
 * @category   Zend
 * @package    Zend_Validate
 * @copyright  Copyright (c) 2005-2008 Zend Technologies USA Inc. (http://www.zend.com)
 * @license    http://framework.zend.com/license/new-bsd     New BSD License
 * @version    $Id: Ip.php 13104 2008-12-08 22:31:50Z tjohns $
 */

/**
 * @see Zend_Validate_Abstract
 */
require_once 'Zend/Validate/Abstract.php';

/**
 * @category   Zend
 * @package    Zend_Validate
 * @copyright  Copyright (c) 2005-2008 Zend Technologies USA Inc. (http://www.zend.com)
 * @license    http://framework.zend.com/license/new-bsd     New BSD License
 */
class Zend_Validate_Ip extends Zend_Validate_Abstract
{
    const NOT_IP_ADDRESS = 'notIpAddress';

    /**
     * @var array
     */
    protected $_messageTemplates = array(
        self::NOT_IP_ADDRESS => "'%value%' does not appear to be a valid IP address"
    );

    /**
     * Defined by Zend_Validate_Interface
     *
     * Returns true if and only if $value is a valid IP address
     *
     * @param  mixed $value
     * @return boolean
     */
    public function isValid($value)
    {
        $valueString = (string) $value;

        $this->_setValue($valueString);

        if ((ip2long($valueString) === false) || (long2ip(ip2long($valueString)) !== $valueString)) {
            if (!function_exists('inet_pton')) {
                $this->_error();
                return false;
            } else if ((@inet_pton($value) === false) ||(inet_ntop(@inet_pton($value)) !== $valueString)) {
                $this->_error();
                return false;
            }
        }

        return true;
    }

}
